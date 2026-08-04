import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { TENANT_CONFIG } from '../config/tenant';
import { clearSession, getAccessToken } from './session';
import { getApiBaseUrl, getApiOrigin, subscribeApiBaseUrl } from '../api/config';

const PUBLIC_ENDPOINTS = [
  '/sports/matches/',
  '/sports/tournaments/',
  '/jobs/',
  '/real-estate/',
  '/payments/packages/',
  '/payments/config/',
  '/events/',
  '/advertising/sponsorships/plans/',
  '/advertising/sponsorships/availability/',
  '/advertising/campaigns/plans/',
  '/sports/banners/config/',
  '/contact/messages/',
  '/auth/users-count/',
  '/sports/player-suspensions/',
];

/** Axios instance — `baseURL` follows `src/api/config.ts` (env + optional DEV switch). */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

subscribeApiBaseUrl((baseUrl) => {
  api.defaults.baseURL = baseUrl;
});

api.interceptors.request.use((config) => {
  // Keep in sync if LocalStorage switch changed without reload.
  config.baseURL = getApiBaseUrl();

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const tenant = localStorage.getItem('tenant_slug') || TENANT_CONFIG.slug;
  config.headers['X-Tenant'] = tenant;

  return config;
});

const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  refreshPromise = axios
    .post(`${getApiBaseUrl()}/auth/refresh/`, { refresh: refreshToken })
    .then((response) => {
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return access as string;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const access = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        clearSession();

        const isAuthRoute =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register';
        const isProtectedPage =
          !isPublicEndpoint(originalRequest.url) &&
          !originalRequest.url?.includes('/auth/');

        if (isProtectedPage && !isAuthRoute) {
          window.location.replace('/login');
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const base = getApiOrigin();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
