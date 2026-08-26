import { registerSW } from 'virtual:pwa-register';
import { APP_VERSION } from '../config/appVersion';

type UpdateFn = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateFn | undefined;
let refreshing = false;

/**
 * Registro PWA en modo autoUpdate:
 * - skipWaiting + clientsClaim en workbox
 * - al detectar SW nuevo → aplica update y recarga sin bloquear al usuario
 */
export function setupPwaUpdates(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // autoUpdate: aplicar de inmediato (sin banner bloqueante)
      window.dispatchEvent(new Event('pwa:need-refresh'));
      void applyPwaUpdate();
    },
    onOfflineReady() {
      window.dispatchEvent(new Event('pwa:offline-ready'));
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
      // Poll cada 60s por si el hosting no empuja el SW al instante
      window.setInterval(checkForUpdate, 60_000);
    },
    onRegisterError(error) {
      console.error('[PWA] Error registrando Service Worker:', error);
    },
  });
}

/** Activa el SW nuevo y recarga con los assets recientes. */
export async function applyPwaUpdate(): Promise<void> {
  try {
    if (updateSW) {
      await updateSW(true);
      return;
    }
  } catch {
    /* fall through */
  }
  window.location.reload();
}

/**
 * Si APP_VERSION cambió respecto a localStorage, limpia Cache Storage
 * y fuerza una recarga única para servir el build nuevo.
 */
export async function purgeCachesIfVersionChanged(): Promise<void> {
  if (typeof window === 'undefined') return;
  const KEY = 'chever_app_version';
  try {
    const prev = localStorage.getItem(KEY);
    if (prev === APP_VERSION) return;

    localStorage.setItem(KEY, APP_VERSION);

    if (prev == null) {
      // Primera visita: solo persistir versión, no recargar
      return;
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    const flag = 'chever_version_reloaded';
    if (sessionStorage.getItem(flag) === APP_VERSION) return;
    sessionStorage.setItem(flag, APP_VERSION);
    window.location.reload();
  } catch {
    /* ignore storage errors */
  }
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
        const standalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
        if (!standalone && 'serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
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
