import { api } from './api';
import { CREDIT_COSTS, type CreditPackage } from '../config/credits';

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

  /** Historial de compras enriquecido del usuario autenticado. */
  getMyPurchases: () => api.get<PurchaseHistoryItem[]>('/payments/my-purchases/'),

  getSportsSubscriptionStatus: () =>
    api.get<SportsSubscriptionStatus>('/subscriptions/sports-status/'),

  activateSportsModule: (creditsAmount: number = CREDIT_COSTS.sportsModule) =>
    api.post<SportsSubscriptionStatus & { success: boolean; message: string; credits: number }>(
      '/subscriptions/activate-sports/',
      { credits_amount: creditsAmount, credits: creditsAmount },
    ),
};

export interface SportsSubscriptionStatus {
  sports_module_active: boolean;
  sports_module_expires_at: string | null;
  sports_module_cost: number;
  sports_module_days: number;
  has_access?: boolean;
}

// ─── Tipos del historial de compras ──────────────────────────────────────────

export type PurchaseStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

export interface PurchaseHistoryItem {
  id: string;
  package_id: string;
  package_name: string;
  package_description: string;
  credits_amount: number;
  amount_cop: number;
  mp_payment_id: string | null;
  status: PurchaseStatus;
  status_display: string;
  credits_applied: boolean;
  created_at: string;
  updated_at: string;
}

export const moderationApi = {
  reportPublication: (data: {
    content_type: 'job' | 'real_estate' | 'tournament' | 'event';
    object_id: string;
    reason: 'fraude' | 'contenido_inapropiado' | 'discriminacion';
    description?: string;
  }) => api.post('/moderation/reports/', data),
};
