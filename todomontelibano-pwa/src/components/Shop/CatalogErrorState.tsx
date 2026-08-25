import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import BrandLogo from '../Brand/BrandLogo';

type Props = {
  onRetry: () => void;
  isRetrying?: boolean;
  message?: string;
};

/**
 * Error de API acotado al catálogo: no tumba nav, footer ni el resto de la app.
 */
const CatalogErrorState: React.FC<Props> = ({
  onRetry,
  isRetrying = false,
  message = 'No se pudo cargar el catálogo en este momento',
}) => {
  return (
    <div
      role="alert"
      className="relative max-w-xl mx-auto overflow-hidden rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-6 py-10 text-center"
    >
      <BrandLogo
        linkToHome={false}
        variant="mark"
        className="pointer-events-none absolute -right-4 -bottom-2 h-28 w-auto max-w-[10rem] opacity-[0.08] dark:opacity-[0.12]"
      />
      <AlertTriangle className="relative w-10 h-10 mx-auto text-amber-600 dark:text-amber-400 mb-4" />
      <h2 className="relative text-lg font-extrabold text-gray-900 dark:text-white">{message}</h2>
      <p className="relative mt-2 text-sm text-gray-600 dark:text-gray-400">
        La tienda sigue disponible: puedes navegar, ver el carrito y volver a intentar.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="relative mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        Reintentar
      </button>
    </div>
  );
};

export default CatalogErrorState;
