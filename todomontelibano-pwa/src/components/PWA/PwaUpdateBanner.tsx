import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Con autoUpdate la recarga es automática. Este banner solo aparece un instante
 * si el evento se dispara y el reload tarda (feedback visual no bloqueante).
 */
const PwaUpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      // Ocultar si el reload no ocurre en ~3s (fallback visual)
      window.setTimeout(() => setVisible(false), 3000);
    };
    window.addEventListener('pwa:need-refresh', show);
    return () => window.removeEventListener('pwa:need-refresh', show);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] w-auto sm:w-[min(92vw,24rem)] rounded-3xl border border-violet-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-violet-800/50 dark:bg-gray-950/95">
      <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm font-semibold">Actualizando a la nueva versión…</span>
      </div>
    </div>
  );
};

export default PwaUpdateBanner;
