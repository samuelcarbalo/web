const CHUNK_RELOAD_KEY = 'chunk_reload_v1';

export function isChunkLoadError(error: unknown): boolean {
  const err = error as { name?: string; message?: string } | undefined;
  const name = err?.name || '';
  const msg = String(err?.message || error || '');
  return (
    name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Expected a JavaScript-or-Wasm module/i.test(msg) ||
    /MIME type of ['"]text\/html['"]/i.test(msg)
  );
}

export function alreadyAttemptedChunkReload(): boolean {
  try {
    return sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

/**
 * Recupera chunks obsoletos tras un deploy.
 * Limpia caches de assets pero NO desregistra el Service Worker de la PWA instalada
 * (unregister + reinstall = “descargar otra vez” la misma app).
 */
export async function recoverFromStaleChunks(): Promise<boolean> {
  if (alreadyAttemptedChunkReload()) return false;

  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  } catch {
    /* ignore */
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => /workbox|assets|pages|precach/i.test(k))
          .map((k) => caches.delete(k)),
      );
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.map(async (reg) => {
          try {
            await reg.update();
          } catch {
            /* ignore */
          }
        }),
      );
      if (!isStandalonePwa()) {
        regs.forEach((reg) => {
          reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        });
      }
    }
  } catch {
    /* ignore */
  }

  const url = new URL(window.location.href);
  url.searchParams.set('_chunk', Date.now().toString());
  window.location.replace(url.toString());
  return true;
}

/**
 * Solo recupera ante errores reales de chunk/MIME.
 * No disparar por cualquier error en <script type="module"> (eso provocaba
 * recargas infinitas y pantalla de arranque congelada).
 */
export function setupChunkLoadRecovery(): void {
  if (typeof window === 'undefined') return;

  const handler = (event: ErrorEvent) => {
    const msg = event.message || '';
    if (isChunkLoadError(event.error) || /MIME type of ['"]text\/html['"]/i.test(msg)) {
      void recoverFromStaleChunks();
    }
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    if (isChunkLoadError(event.reason)) {
      void recoverFromStaleChunks();
    }
  };

  window.addEventListener('error', handler, true);
  window.addEventListener('unhandledrejection', rejectionHandler);
}
