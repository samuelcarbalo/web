import { getApiOrigin } from '../api/config';

/** Ping cada 12 min (Render free suspende ~15 min sin tráfico). */
const KEEP_ALIVE_INTERVAL_MS = 12 * 60 * 1000;
const PING_TIMEOUT_MS = 30_000;

let intervalId: ReturnType<typeof setInterval> | null = null;

function healthUrl(): string {
  return `${getApiOrigin()}/healthz`;
}

async function pingBackend(): Promise<void> {
  if (typeof window === 'undefined') return;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    await fetch(healthUrl(), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
  } catch {
    /* cold start o red: el ping es best-effort */
  } finally {
    window.clearTimeout(timer);
  }
}

/** Mantiene la instancia de Render activa con pings periódicos (solo producción). */
export function startRenderKeepAlive(): () => void {
  if (!import.meta.env.PROD || typeof window === 'undefined') {
    return () => undefined;
  }

  if (intervalId !== null) {
    return () => undefined;
  }

  void pingBackend();
  intervalId = window.setInterval(() => {
    void pingBackend();
  }, KEEP_ALIVE_INTERVAL_MS);

  return () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}
