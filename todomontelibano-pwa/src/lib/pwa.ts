import { registerSW } from 'virtual:pwa-register';
import { APP_VERSION } from '../config/appVersion';

type UpdateFn = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateFn | undefined;
/** Evita doble reload cuando skipWaiting activa el SW nuevo. */
let controllerReloadArmed = false;
let setupDone = false;
let refreshNotified = false;

function armControllerReload(): void {
  controllerReloadArmed = true;
}

function notifyNeedRefresh(): void {
  if (refreshNotified) return;
  refreshNotified = true;
  window.dispatchEvent(new Event('pwa:need-refresh'));
}

function activateWaitingWorker(worker: ServiceWorker | null | undefined): void {
  if (!worker) return;
  armControllerReload();
  worker.postMessage({ type: 'SKIP_WAITING' });
  void updateSW?.(false);
}

/**
 * Registro PWA en modo autoUpdate.
 * - NO llamar updateSW(true) / location.reload() en onNeedRefresh (genera bucles).
 * - Una sola recarga en controllerchange cuando el SW nuevo toma el control.
 */
export function setupPwaUpdates(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (setupDone) return;
  setupDone = true;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controllerReloadArmed) return;
    controllerReloadArmed = false;
    window.location.reload();
  });

  updateSW = registerSW({
    // false = no registra en el arranque síncrono; se llama tras idle desde main.tsx
    immediate: false,
    onNeedRefresh() {
      notifyNeedRefresh();
      armControllerReload();
      void updateSW?.(false);
    },
    onOfflineReady() {
      window.dispatchEvent(new Event('pwa:offline-ready'));
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      if (registration.waiting && navigator.serviceWorker.controller) {
        notifyNeedRefresh();
        activateWaitingWorker(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state !== 'installed') return;
          if (!navigator.serviceWorker.controller) return;
          notifyNeedRefresh();
          activateWaitingWorker(worker);
        });
      });

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

/**
 * Activa el SW en waiting. Por defecto NO recarga (evita bucles).
 * Pasar `forceReload=true` solo desde UI explícita del usuario.
 */
export async function applyPwaUpdate(forceReload = false): Promise<void> {
  try {
    if (updateSW) {
      armControllerReload();
      await updateSW(forceReload);
      return;
    }
  } catch {
    /* fall through */
  }
  if (forceReload) window.location.reload();
}

/**
 * Si APP_VERSION cambió, limpia Cache Storage y actualiza la marca.
 * Sin location.reload() — el autoUpdate del SW aplica el build nuevo.
 */
export async function purgeCachesIfVersionChanged(): Promise<void> {
  if (typeof window === 'undefined') return;
  const KEY = 'chever_app_version';
  try {
    const prev = localStorage.getItem(KEY);
    if (prev === APP_VERSION) return;

    localStorage.setItem(KEY, APP_VERSION);

    if (prev == null) return;

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Si la app no monta (root vacío), limpia caches y recarga UNA vez.
 */
export function setupBlankScreenRecovery(): void {
  if (typeof window === 'undefined') return;

  const flag = 'sw_blank_recovery_v2';

  window.setTimeout(() => {
    const root = document.getElementById('root');
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
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
        }
      } finally {
        window.location.reload();
      }
    };

    void cleanup();
  }, 4500);
}
