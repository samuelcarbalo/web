import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { TENANT_CONFIG } from '../config/tenant';
import {
  enforceSessionMaxAge,
  getAccessToken,
  markSessionStart,
  purgeClientSession,
} from './session';
import { getApiBaseUrl, getApiOrigin, subscribeApiBaseUrl } from '../api/config';
import { trackApiRequestEnd, trackApiRequestStart } from './coldStartUi';

/** Margen para cold starts de Render free tier (~30–60 s). */
export const API_TIMEOUT_MS = 60_000;

const PUBLIC_ENDPOINTS = [
  '/sports/matches/',
  '/sports/tournaments/',
  '/jobs/',
  '/real-estate/',
  '/payments/packages/',
  '/payments/config/',
  '/ecommerce/',
  '/store/',
  '/events/',
  '/advertising/sponsorships/plans/',
  '/advertising/sponsorships/availability/',
  '/advertising/campaigns/plans/',
  '/sports/banners/config/',
  '/contact/messages/',
  '/auth/users-count/',
  '/auth/password/',
  '/sports/player-suspensions/',
];

/** Axios instance — `baseURL` follows `src/api/config.ts` (env + optional DEV switch). */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

subscribeApiBaseUrl((baseUrl) => {
  api.defaults.baseURL = baseUrl;
});

api.interceptors.request.use(async (config) => {
  trackApiRequestStart();
  // Keep in sync if LocalStorage switch changed without reload.
  config.baseURL = getApiBaseUrl();

  // TTL 24h: si expiró, limpia todo antes de disparar la petición.
  if (getAccessToken()) {
    const expired = await enforceSessionMaxAge();
    if (expired) {
      return Promise.reject(new Error('Sesión expirada (24h)'));
    }
  }

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
    .post(`${getApiBaseUrl()}/auth/refresh/`, { refresh: refreshToken }, { timeout: API_TIMEOUT_MS })
    .then((response) => {
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      // Renovar marca de sesión al refrescar token con éxito
      markSessionStart();
      return access as string;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => {
    trackApiRequestEnd();
    return response;
  },
  async (error: AxiosError) => {
    trackApiRequestEnd();
    if (axios.isCancel(error) || error.message === 'Sesión expirada (24h)') {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // No intentar refresh en el propio endpoint de refresh/login
      const url = originalRequest.url || '';
      if (url.includes('/auth/refresh/') || url.includes('/auth/login/')) {
        await purgeClientSession({ redirectToHome: true });
        return Promise.reject(error);
      }

      try {
        const access = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        await purgeClientSession({ redirectToHome: true });
        return Promise.reject(error);
      }
    }

    // 401 sin config reintentable → inicio público (no /login)
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';
      if (!isAuthRoute && !isPublicEndpoint(originalRequest?.url)) {
        await purgeClientSession({ redirectToHome: true });
      }
    }

    return Promise.reject(error);
  },
);

export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const base = getApiOrigin();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
