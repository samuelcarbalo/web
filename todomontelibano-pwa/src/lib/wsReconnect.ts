/** Utilidades compartidas para reconexión WebSocket con backoff exponencial. */

/** Token ausente o inválido — no reintentar. */
export const WS_CLOSE_UNAUTHORIZED = 4001;

/** Token JWT expirado — no reintentar hasta renovar sesión. */
export const WS_CLOSE_TOKEN_EXPIRED = 4003;

const DEFAULT_BASE_MS = 3_500;
const DEFAULT_MAX_MS = 30_000;

/** Calcula delay con backoff exponencial + jitter ligero. */
export function getWsReconnectDelay(
  attempt: number,
  baseMs = DEFAULT_BASE_MS,
  maxMs = DEFAULT_MAX_MS,
): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** attempt);
  const jitter = Math.random() * 800;
  return Math.round(exponential + jitter);
}

/** Códigos de cierre que no deben disparar reconexión automática. */
export function shouldReconnectWebSocket(closeCode: number): boolean {
  if (closeCode === WS_CLOSE_UNAUTHORIZED || closeCode === WS_CLOSE_TOKEN_EXPIRED) {
    return false;
  }
  // Cierre limpio iniciado por el cliente
  if (closeCode === 1000) return false;
  return true;
}
