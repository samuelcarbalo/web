/**
 * API base URL controller for Vite + Django.
 *
 * Default source: `import.meta.env.VITE_API_URL` (.env.development / .env.production).
 * In development only, LocalStorage can force local or production backends.
 *
 * Console helpers (DEV):
 *   __apiSwitch.useLocal()
 *   __apiSwitch.useProduction()
 *   __apiSwitch.useAuto()
 *   __apiSwitch.current()
 */

export const API_URLS = {
  local: 'http://127.0.0.1:8000/api/v1',
  production: 'https://missingdigitalback.onrender.com/api/v1',
} as const;

export type ApiEnvironment = keyof typeof API_URLS;
/** `auto` = follow Vite mode env file; otherwise force a backend. */
export type ApiTarget = 'auto' | ApiEnvironment;

const STORAGE_KEY = 'capisj_api_target';

type ApiBaseListener = (baseUrl: string) => void;

const listeners = new Set<ApiBaseListener>();

function readStoredTarget(): ApiTarget {
  if (typeof window === 'undefined') return 'auto';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'local' || raw === 'production' || raw === 'auto') return raw;
  return 'auto';
}

function defaultUrlForMode(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  return import.meta.env.PROD ? API_URLS.production : API_URLS.local;
}

/**
 * Resolves the active API base URL.
 * Manual LocalStorage override only applies in development.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    const target = readStoredTarget();
    if (target === 'local') return API_URLS.local;
    if (target === 'production') return API_URLS.production;
  }

  return defaultUrlForMode();
}

/** Origin without `/api/v1` (media files, websockets). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export function getWebSocketBaseUrl(): string {
  return getApiOrigin().replace(/^http/, 'ws');
}

export function getApiTarget(): ApiTarget {
  if (!import.meta.env.DEV) return 'auto';
  return readStoredTarget();
}

/**
 * Force API target while developing locally.
 * Pass `auto` to clear the override and follow `.env.development`.
 * Reloads the page by default so all clients pick up the new base URL.
 */
export function setApiTarget(target: ApiTarget, options?: { reload?: boolean }): void {
  if (!import.meta.env.DEV) {
    console.warn('[api/config] API target switch is only available in development.');
    return;
  }

  if (target === 'auto') {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, target);
  }

  const next = getApiBaseUrl();
  listeners.forEach((listener) => listener(next));

  const shouldReload = options?.reload ?? true;
  if (shouldReload) {
    window.location.reload();
  }
}

export function subscribeApiBaseUrl(listener: ApiBaseListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isUsingProductionApi(): boolean {
  return getApiBaseUrl() === API_URLS.production;
}

declare global {
  interface Window {
    __apiSwitch?: {
      useLocal: () => void;
      useProduction: () => void;
      useAuto: () => void;
      current: () => { target: ApiTarget; baseUrl: string };
    };
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__apiSwitch = {
    useLocal: () => setApiTarget('local'),
    useProduction: () => setApiTarget('production'),
    useAuto: () => setApiTarget('auto'),
    current: () => ({ target: getApiTarget(), baseUrl: getApiBaseUrl() }),
  };
}
