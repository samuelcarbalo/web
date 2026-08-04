import React, { useId, useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone, MonitorSmartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { BRAND_DISPLAY_NAME } from '../../config/brand';

type Variant = 'hero' | 'cta' | 'compact';

type PwaInstallButtonProps = {
  variant?: Variant;
  className?: string;
  label?: string;
  /** If true (default), the button is always visible for guests and logged-in users. */
  alwaysVisible?: boolean;
};

const heroClassName =
  'inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl';

const ctaClassName =
  'inline-flex items-center justify-center px-10 py-4 text-white font-bold border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl';

const compactClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition-colors';

const variantClass: Record<Variant, string> = {
  hero: heroClassName,
  cta: ctaClassName,
  compact: compactClassName,
};

type GuideKind = 'ios' | 'desktop';

const InstallGuideModal: React.FC<{
  open: boolean;
  kind: GuideKind;
  onClose: () => void;
  titleId: string;
}> = ({ open, kind, onClose, titleId }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-[var(--color-text-muted)] hover:bg-primary-100 dark:hover:bg-primary-800"
          aria-label="Cerrar instrucciones"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300">
            {kind === 'ios' ? <Smartphone className="h-5 w-5" /> : <MonitorSmartphone className="h-5 w-5" />}
          </span>
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[var(--color-text)]">
              Instalar {BRAND_DISPLAY_NAME}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {kind === 'ios' ? 'En iPhone o iPad (Safari)' : 'Desde tu navegador'}
            </p>
          </div>
        </div>

        {kind === 'ios' ? (
          <ol className="mt-6 space-y-4 text-sm text-[var(--color-text)]">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                1
              </span>
              <p className="pt-1.5">
                Toca el botón <Share className="inline h-4 w-4 text-info-500 align-text-bottom" />{' '}
                <strong>Compartir</strong> en la barra de Safari.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                2
              </span>
              <p className="pt-1.5">
                Desplázate y selecciona{' '}
                <PlusSquare className="inline h-4 w-4 text-secondary-600 align-text-bottom" />{' '}
                <strong>Agregar a pantalla de inicio</strong>.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                3
              </span>
              <p className="pt-1.5">
                Confirma con <strong>Agregar</strong>. El ícono de la app aparecerá en tu pantalla de inicio.
              </p>
            </li>
          </ol>
        ) : (
          <ol className="mt-6 space-y-4 text-sm text-[var(--color-text)]">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                1
              </span>
              <p className="pt-1.5">
                En Chrome o Edge, abre el menú <strong>⋮</strong> (arriba a la derecha).
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                2
              </span>
              <p className="pt-1.5">
                Elige <strong>Instalar aplicación</strong> o <strong>Instalar {BRAND_DISPLAY_NAME}</strong>.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                3
              </span>
              <p className="pt-1.5">
                Confirma la instalación. En Android también puedes usar el banner “Agregar a la pantalla de inicio”.
              </p>
            </li>
          </ol>
        )}

        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
          Entendido
        </button>
      </div>
    </div>
  );
};

/**
 * Always visible for guests and authenticated users (unless already running as installed PWA).
 * Uses native prompt when available; otherwise shows an install guide modal.
 */
const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  variant = 'hero',
  className = '',
  label = 'Instalar App',
  alwaysVisible = true,
}) => {
  const { isInstallable, isInstalled, isIos, handleInstall, isReady } = usePWAInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideKind, setGuideKind] = useState<GuideKind>('desktop');
  const [installing, setInstalling] = useState(false);
  const titleId = useId();

  if (!isReady) return null;

  const classes = `${variantClass[variant]} ${className}`.trim();
  const iconSize = variant === 'compact' ? 'h-4 w-4' : variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4';

  if (isInstalled) {
    return (
      <span
        className={`${classes} cursor-default opacity-90 border-emerald-300/40 bg-emerald-500/10`}
        title="La aplicación ya está instalada en este dispositivo"
      >
        <CheckCircle2 className={`mr-2 ${iconSize}`} />
        App instalada
      </span>
    );
  }

  if (!alwaysVisible && !isInstallable && !isIos) return null;

  const openGuide = (kind: GuideKind) => {
    setGuideKind(kind);
    setGuideOpen(true);
  };

  const onClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        const outcome = await handleInstall();
        if (outcome === null) openGuide(isIos ? 'ios' : 'desktop');
      } finally {
        setInstalling(false);
      }
      return;
    }

    openGuide(isIos ? 'ios' : 'desktop');
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={installing}
        className={classes}
        aria-busy={installing}
      >
        <Download className={`mr-2 ${iconSize}`} />
        {installing ? 'Instalando…' : label}
      </button>
      <InstallGuideModal
        open={guideOpen}
        kind={guideKind}
        onClose={() => setGuideOpen(false)}
        titleId={titleId}
      />
    </>
  );
};

export default PwaInstallButton;
