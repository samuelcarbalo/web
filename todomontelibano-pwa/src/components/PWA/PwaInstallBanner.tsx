import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { BRAND_DISPLAY_NAME } from '../../config/brand';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import BrandLogo from '../Brand/BrandLogo';

const DISMISS_KEY = 'pwa-install-banner-dismissed';

const PwaInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, handleInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });

  useEffect(() => {
    if (isInstalled) setDismissed(true);
  }, [isInstalled]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  const onInstall = async () => {
    await handleInstall();
    setDismissed(true);
  };

  if (dismissed || !isInstallable || isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,24rem)] rounded-3xl border border-secondary-200/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-secondary-900/50 dark:bg-primary-950/95">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-primary-800 dark:hover:text-gray-200"
        aria-label="Cerrar sugerencia de instalación"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="pr-8">
        <div className="flex items-center gap-3">
          <BrandLogo linkToHome={false} variant="mark" className="h-10 w-auto max-w-[7rem] shrink-0" />
          <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <Download className="h-4 w-4" />
            <span className="text-sm font-semibold">Instala {BRAND_DISPLAY_NAME}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Acceso rápido a la plataforma desde tu dispositivo, sin abrir el navegador cada vez.
        </p>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-primary-800"
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={onInstall}
          className="rounded-2xl bg-secondary-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-800 dark:hover:bg-secondary-600"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
