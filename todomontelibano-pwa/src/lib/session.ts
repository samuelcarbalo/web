import { useAuthStore } from '../store/authStore';

export const SESSION_TIMESTAMP_KEY = 'session_timestamp';
/** TTL de sesión local: 24 horas. */
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const AUTH_COOKIE_HINTS = ['access', 'refresh', 'token', 'session', 'jwt', 'csrftoken'];

/** Limpia tokens JWT y estado Zustand de autenticación. */
export function clearSession(): void {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  } catch {
    /* ignore */
  }
  try {
    useAuthStore.getState().logout();
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

export function hasValidSessionHint(): boolean {
  return !!getAccessToken() && !isSessionExpired();
}

/** Marca el inicio (o renovación) de sesión tras login/register. */
export function markSessionStart(at: number = Date.now()): void {
  try {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, String(at));
  } catch {
    /* ignore */
  }
}

export function getSessionTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function isSessionExpired(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const ts = getSessionTimestamp();
  // Sesiones antiguas sin timestamp: forzar marca y no expulsar en el mismo tick.
  if (ts == null) {
    markSessionStart();
    return false;
  }
  return Date.now() - ts > SESSION_MAX_AGE_MS;
}

function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  const pathRoots = ['/', window.location.pathname];
  for (const part of cookies) {
    const name = part.split('=')[0]?.trim();
    if (!name) continue;
    const lower = name.toLowerCase();
    const isAuthRelated = AUTH_COOKIE_HINTS.some((h) => lower.includes(h));
    if (!isAuthRelated && lower !== 'access_token' && lower !== 'refresh_token') {
      // Solo limpiamos cookies de sesión/auth; evitamos borrar preferencias no relacionadas si no parecen auth.
      if (!lower.includes('auth') && !lower.includes('session')) continue;
    }
    for (const path of pathRoots) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }
  }
}

/** Borra Cache Storage del Service Worker (y otras caches del origen). */
export async function clearServiceWorkerCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    /* ignore */
  }
}

/**
 * Limpieza total de cliente: tokens, storages, cookies de auth y caches SW.
 * Tras expirar o cerrar sesión se va al home público (`/`), no a `/login`.
 * `/login` queda para quien intenta entrar a una ruta protegida (ProtectedRoute).
 */
export async function purgeClientSession(options?: {
  redirectToHome?: boolean;
}): Promise<void> {
  const redirect = options?.redirectToHome !== false;
  const onAuthPage =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/login' ||
      window.location.pathname === '/register' ||
      window.location.pathname === '/forgot-password' ||
      window.location.pathname === '/recuperar-contrasena');

  clearSession();
  clearAuthCookies();

  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  try {
    // Preservar solo preferencias no sensibles si existen.
    const theme = localStorage.getItem('theme');
    const tenant = localStorage.getItem('tenant_slug');
    localStorage.clear();
    if (theme) localStorage.setItem('theme', theme);
    if (tenant) localStorage.setItem('tenant_slug', tenant);
  } catch {
    /* ignore */
  }

  await clearServiceWorkerCaches();

  if (redirect && typeof window !== 'undefined' && !onAuthPage) {
    if (window.location.pathname !== '/') {
      window.location.replace('/');
    }
  }
}

/** Si la sesión supera 24h, purga y redirige al inicio. Retorna true si expulsó. */
export async function enforceSessionMaxAge(): Promise<boolean> {
  if (!getAccessToken()) return false;
  if (!isSessionExpired()) return false;
  await purgeClientSession({ redirectToHome: true });
  return true;
}
