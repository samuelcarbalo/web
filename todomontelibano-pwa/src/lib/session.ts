import { useAuthStore } from '../store/authStore';

/** Limpia tokens, store persistido y estado de autenticación. */
export function clearSession(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  useAuthStore.getState().logout();
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function hasValidSessionHint(): boolean {
  return !!getAccessToken();
}
