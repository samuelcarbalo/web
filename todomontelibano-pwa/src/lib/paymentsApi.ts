import { api } from './api';
import type { CreditPackage } from '../config/credits';

export interface PreferenceResponse {
  preference_id: string;
  init_point?: string;
  sandbox_init_point?: string;
  order_id: string;
}

export const paymentsApi = {
  getPackages: () => api.get<CreditPackage[]>('/payments/packages/'),

  getMpConfig: () => api.get<{ public_key: string }>('/payments/config/'),

  createPreference: (packageId: string) =>
    api.post<PreferenceResponse>('/payments/create-preference/', { package_id: packageId }),

  getMyOrders: () => api.get('/payments/my-orders/'),
};

export const moderationApi = {
  reportPublication: (data: {
    content_type: 'job' | 'real_estate' | 'tournament' | 'event';
    object_id: string;
    reason: 'fraude' | 'contenido_inapropiado' | 'discriminacion';
    description?: string;
  }) => api.post('/moderation/reports/', data),
};
