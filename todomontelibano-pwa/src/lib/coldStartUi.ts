/** Mensaje cuando la API tarda (cold start Render free tier). */
export const COLD_START_HINT =
  'Conectando con el servidor... En la versión gratuita esto puede tomar unos segundos extras mientras despierta la instancia 🚀';

const SLOW_HINT_DELAY_MS = 3_000;

type ColdStartListener = (visible: boolean) => void;

let pendingRequests = 0;
let slowHintTimer: ReturnType<typeof setTimeout> | null = null;
let hintVisible = false;
const listeners = new Set<ColdStartListener>();

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener(hintVisible);
    } catch {
      /* ignore */
    }
  });
}

function setHintVisible(visible: boolean): void {
  if (hintVisible === visible) return;
  hintVisible = visible;
  notify();
}

export function subscribeColdStartHint(listener: ColdStartListener): () => void {
  listeners.add(listener);
  listener(hintVisible);
  return () => listeners.delete(listener);
}

export function trackApiRequestStart(): void {
  pendingRequests += 1;
  if (pendingRequests === 1 && !slowHintTimer) {
    slowHintTimer = window.setTimeout(() => {
      if (pendingRequests > 0) setHintVisible(true);
    }, SLOW_HINT_DELAY_MS);
  }
}

export function trackApiRequestEnd(): void {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    if (slowHintTimer) {
      window.clearTimeout(slowHintTimer);
      slowHintTimer = null;
    }
    setHintVisible(false);
  }
}
