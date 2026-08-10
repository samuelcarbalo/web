import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * React.lazy con reintento ante chunks 404 tras un nuevo deploy (hash distinto).
 * Si falla de nuevo, recarga la página una sola vez.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const key = 'chunk_reload_v1';
    try {
      return await factory();
    } catch (error) {
      const alreadyReloaded = sessionStorage.getItem(key) === '1';
      if (!alreadyReloaded) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // Nunca resuelve: la recarga corta el ciclo
        return new Promise(() => undefined) as Promise<{ default: T }>;
      }
      sessionStorage.removeItem(key);
      throw error;
    }
  });
}

/** Limpia la marca tras una carga exitosa de la app. */
export function clearChunkReloadFlag() {
  try {
    sessionStorage.removeItem('chunk_reload_v1');
  } catch {
    /* ignore */
  }
}
