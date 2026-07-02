import axios from 'axios';
import { TENANT_CONFIG } from '../config/tenant';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PUBLIC_ENDPOINTS = [
  '/sports/matches/',      // GET match detail
  '/sports/tournaments/',  // GET tournaments
  '/jobs/',                // GET jobs list/detail
  '/real-estate/',         // GET real estate list/detail
  '/payments/packages/',   // GET catálogo de créditos (público)
  '/payments/config/',     // GET public key MP
  '/events/',              // GET eventos
  '/advertising/sponsorships/plans/',
  '/advertising/sponsorships/availability/',
  '/advertising/campaigns/plans/',
  '/sports/banners/config/',
  '/contact/messages/',
];
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Agregar tenant header si existe
  const tenant = localStorage.getItem('tenant_slug') || TENANT_CONFIG.slug;
  config.headers['X-Tenant'] = tenant;
  
  return config;
});
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Response interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (!isPublicEndpoint(originalRequest.url)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};