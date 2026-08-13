import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { clearChunkReloadFlag, recoverFromStaleChunks } from './chunkRecovery';

/**
 * React.lazy que recarga una sola vez si el chunk ya no existe
 * (el hosting SPA responde index.html con MIME text/html).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      clearChunkReloadFlag();
      return mod;
    } catch (error) {
      const reloading = await recoverFromStaleChunks();
      if (reloading) {
        return new Promise(() => undefined) as Promise<{ default: T }>;
      }
      throw error;
    }
  });
}
