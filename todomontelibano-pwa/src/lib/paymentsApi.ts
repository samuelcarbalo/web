import { api } from './api';
import type { CreditPackage } from '../config/credits';

export interface MpPublicConfig {
  public_key: string;
  is_production: boolean;
}

export interface MpAdminConfig {
  is_production: boolean;
  public_key_test: string;
  access_token_test: string;
  public_key_prod: string;
  access_token_prod: string;
  client_id_prod: string;
  client_secret_prod: string;
  updated_at: string;
}

export type MpAdminConfigUpdate = Partial<
  Pick<
    MpAdminConfig,
    | 'is_production'
    | 'public_key_test'
    | 'access_token_test'
    | 'public_key_prod'
    | 'access_token_prod'
    | 'client_id_prod'
    | 'client_secret_prod'
  >
>;

export interface PreferenceResponse {
  preference_id: string;
  init_point?: string;
  sandbox_init_point?: string;
  is_production?: boolean;
  order_id: string;
}

export const paymentsApi = {
  getPackages: () => api.get<CreditPackage[]>('/payments/packages/'),

  getMpConfig: () => api.get<MpPublicConfig>('/payments/config/'),

  getMpAdminConfig: () => api.get<MpAdminConfig>('/payments/admin-config/'),

  updateMpAdminConfig: (payload: MpAdminConfigUpdate) =>
    api.patch<MpAdminConfig>('/payments/admin-config/', payload),

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
