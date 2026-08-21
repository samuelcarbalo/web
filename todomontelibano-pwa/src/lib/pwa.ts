import { registerSW } from 'virtual:pwa-register';

type UpdateFn = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateFn | undefined;

/**
 * Registro PWA en modo prompt: detecta un SW nuevo post-deploy y avisa al usuario.
 * No recarga sola (eso congelaba la pestaña en blanco). El banner llama a applyPwaUpdate().
 * El mismo Service Worker se actualiza in-place; no se desregistra en deploys normales.
 */
export function setupPwaUpdates(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event('pwa:need-refresh'));
    },
    onOfflineReady() {
      window.dispatchEvent(new Event('pwa:offline-ready'));
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Un solo SW controller: evita registros huérfanos que disparen “instalar de nuevo”
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          if (reg !== registration && !reg.active?.scriptURL.includes('sw.js')) {
            /* leave other scopes alone */
          }
        }
      }).catch(() => undefined);

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

/**
 * Si la app no monta (root vacío), limpia caches y recarga UNA vez.
 * No desregistra el Service Worker si la PWA ya está instalada: eso provoca
 * beforeinstallprompt otra vez y una “segunda descarga” de la app.
 */
export function setupBlankScreenRecovery(): void {
  if (typeof window === 'undefined') return;

  const flag = 'sw_blank_recovery_v1';

  window.setTimeout(() => {
    const root = document.getElementById('root');
    // `#app-boot` vive dentro de #root hasta que React monta.
    // Antes se usaba childElementCount > 0 y el spinner contaba como “montado”.
    const stillOnBoot = !!document.getElementById('app-boot');
    const mounted = !!(root && root.childElementCount > 0 && !stillOnBoot);
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
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        // Solo desregistrar SW si NO estamos en standalone (PWA ya instalada)
        const standalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
        if (!standalone && 'serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          // Preferir update del activo en lugar de unregister total
          await Promise.all(
            regs.map(async (r) => {
              try {
                await r.update();
              } catch {
                /* ignore */
              }
            }),
          );
        }
      } finally {
        window.location.reload();
      }
    };

    void cleanup();
  }, 4500);
}
