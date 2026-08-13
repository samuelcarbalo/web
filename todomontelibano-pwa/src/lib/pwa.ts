import { registerSW } from 'virtual:pwa-register';

type UpdateFn = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateFn | undefined;

/**
 * Registro PWA en modo prompt: detecta un SW nuevo post-deploy y avisa al usuario.
 * No recarga sola (eso congelaba la pestaña en blanco). El banner llama a applyPwaUpdate().
 */
export function setupPwaUpdates(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event('pwa:need-refresh'));
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        registration.update().catch(() => undefined);
      };

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

/** Activa el SW nuevo y recarga con los assets recientes (skipWaiting vía plugin). */
export async function applyPwaUpdate(): Promise<void> {
  if (updateSW) {
    await updateSW(true);
    return;
  }
  window.location.reload();
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
