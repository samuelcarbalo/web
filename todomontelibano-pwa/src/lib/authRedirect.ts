/** Persistencia de destino post-login/registro (solo rutas relativas internas). */

const STORAGE_KEY = 'auth_redirect_next';

export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.includes('://')) return false;
  return true;
}

export function setAuthRedirect(path: string): void {
  if (!isSafeInternalPath(path)) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    /* ignore quota / private mode */
  }
}

export function peekAuthRedirect(): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return isSafeInternalPath(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Lee `?next=` o sessionStorage y limpia el storage. */
export function consumeAuthRedirect(fallback = '/dashboard'): string {
  let fromQuery: string | null = null;
  try {
    fromQuery = new URLSearchParams(window.location.search).get('next');
  } catch {
    fromQuery = null;
  }

  let fromStorage: string | null = null;
  try {
    fromStorage = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    fromStorage = null;
  }

  if (isSafeInternalPath(fromQuery)) return fromQuery;
  if (isSafeInternalPath(fromStorage)) return fromStorage;
  return fallback;
}

export function buildLoginUrl(nextPath: string): string {
  setAuthRedirect(nextPath);
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function buildRegisterUrl(nextPath: string): string {
  setAuthRedirect(nextPath);
  return `/register?next=${encodeURIComponent(nextPath)}`;
}

export function buildCreditsIntentPath(packageId?: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams(extra);
  if (packageId) params.set('package', packageId);
  const q = params.toString();
  return q ? `/creditos?${q}` : '/creditos';
}
