import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { clearChunkReloadFlag, recoverFromStaleChunks } from './chunkRecovery';

const IMPORT_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Lazy import timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * React.lazy que recarga una sola vez si el chunk ya no existe
 * (el hosting SPA responde index.html con MIME text/html).
 * Nunca deja Suspense colgado: si la recarga no procede, relanza el error.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await withTimeout(factory(), IMPORT_TIMEOUT_MS);
      clearChunkReloadFlag();
      return mod;
    } catch (error) {
      const reloading = await recoverFromStaleChunks();
      if (reloading) {
        // Navegación en curso: no resolver para evitar UI a medias,
        // pero con techo para que ErrorBoundary pueda actuar si falla replace.
        await new Promise((_, reject) => {
          window.setTimeout(() => reject(error), 8_000);
        });
      }
      throw error;
    }
  });
}
