import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_RELOAD_KEY = 'chunk_reload_v1';

/**
 * React.lazy con un único reintento de reload ante chunks 404 (post-deploy).
 * NO limpiar la marca al boot de main.tsx: eso provocaba bucle infinito de F5
 * (clear → fail → reload → clear → …) y pantalla blanca en la misma pestaña.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        /* ignore */
      }
      return mod;
    } catch (error) {
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
      } catch {
        alreadyReloaded = false;
      }

      if (!alreadyReloaded) {
        try {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        } catch {
          /* ignore */
        }
        // Intentar soltar caches del SW antes del reload
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch {
          /* ignore */
        }
        window.location.reload();
        return new Promise(() => undefined) as Promise<{ default: T }>;
      }

      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        /* ignore */
      }
      throw error;
    }
  });
}
