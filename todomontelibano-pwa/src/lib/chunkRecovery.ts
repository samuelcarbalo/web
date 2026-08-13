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

/**
 * Un reload con cache-bust tras un chunk 404 (el servidor devolvió index.html).
 * Devuelve false si ya se intentó, para mostrar UI en vez de bucle.
 */
export async function recoverFromStaleChunks(): Promise<boolean> {
  if (alreadyAttemptedChunkReload()) return false;

  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  } catch {
    /* ignore */
  }

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }

  const url = new URL(window.location.href);
  url.searchParams.set('_chunk', Date.now().toString());
  window.location.replace(url.toString());
  return true;
}

/** Captura MIME text/html en <script type="module"> (no siempre llega a React.lazy). */
export function setupChunkLoadRecovery(): void {
  if (typeof window === 'undefined') return;

  const handler = (event: ErrorEvent) => {
    const msg = event.message || '';
    const target = event.target;
    const isModuleScript =
      target instanceof HTMLScriptElement &&
      (target.type === 'module' || (target.src || '').includes('/assets/'));

    if (isChunkLoadError(event.error) || /MIME type of ['"]text\/html['"]/i.test(msg) || isModuleScript) {
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
