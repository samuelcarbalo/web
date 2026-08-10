import { registerSW } from 'virtual:pwa-register';

/**
 * Registra el SW con auto-update y fuerza recarga cuando el nuevo worker toma el control.
 * Sin clientsClaim + reload en controllerchange, F5 puede seguir sirviendo index/chunks viejos
 * (pantalla blanca) hasta cerrar todas las pestañas.
 */
export function setupPwaUpdates(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        registration.update().catch(() => undefined);
      };

      // Al volver a la pestaña / foco, buscar SW nuevo (post-deploy)
      window.addEventListener('focus', checkForUpdate);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });

      window.setInterval(checkForUpdate, 60_000);
    },
    onRegisterError(error) {
      console.error('[PWA] Error registrando Service Worker:', error);
    },
  });
}

/** Si la app no monta (root vacío), desregistra SW y limpia caches una sola vez. */
export function setupBlankScreenRecovery(): void {
  if (typeof window === 'undefined') return;

  const flag = 'sw_blank_recovery_v1';

  window.setTimeout(() => {
    const root = document.getElementById('root');
    const mounted = !!(root && root.childElementCount > 0);
    if (mounted) {
      try {
        sessionStorage.removeItem(flag);
      } catch {
        /* ignore */
      }
      return;
    }

    try {
      if (sessionStorage.getItem(flag) === '1') return;
      sessionStorage.setItem(flag, '1');
    } catch {
      /* ignore */
    }

    const cleanup = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } finally {
        window.location.reload();
      }
    };

    void cleanup();
  }, 4500);
}
