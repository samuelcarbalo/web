import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { applyPwaUpdate } from '../../lib/pwa';

const PwaUpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('pwa:need-refresh', show);
    return () => window.removeEventListener('pwa:need-refresh', show);
  }, []);

  if (!visible) return null;

  const onUpdate = async () => {
    setUpdating(true);
    try {
      await applyPwaUpdate();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] w-auto sm:w-[min(92vw,24rem)] rounded-3xl border border-violet-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-violet-800/50 dark:bg-gray-950/95">
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Cerrar aviso de actualización"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="pr-8">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-semibold">Nueva versión disponible</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Hay una nueva versión disponible. Actualiza para cargar los últimos cambios sin perder tu
          sesión.
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={updating}
          onClick={onUpdate}
          className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {updating ? 'Actualizando…' : 'Actualizar ahora'}
        </button>
      </div>
    </div>
  );
};

export default PwaUpdateBanner;
