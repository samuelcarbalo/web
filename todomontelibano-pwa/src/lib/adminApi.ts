import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  full_name?: string;
  role: string;
  user_type: string;
  company_name?: string | null;
  organization?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_unlimited_credits: boolean;
  has_unlimited_credits: boolean;
  credits: number;
  email_verified: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AdminUserList {
  count: number;
  total_pages: number;
  current_page: number;
  results: AdminUser[];
}

export interface JobOfferHistoryRow {
  id: string;
  original_job_id: string;
  title: string;
  company_name: string;
  published_by: string | null;
  published_by_name?: string;
  published_by_email?: string;
  created_at: string;
  expired_at: string | null;
  is_external: boolean;
  offer_type: 'Interna' | 'Externa';
  external_apply_url?: string | null;
  total_applications_count: number;
  metadata?: Record<string, unknown>;
  is_purged: boolean;
  recorded_at: string;
}

export interface JobOfferHistoryList {
  count: number;
  total_pages: number;
  current_page: number;
  results: JobOfferHistoryRow[];
}

export const adminApi = {
  listUsers: (params?: { search?: string; page?: number; is_active?: string }) =>
    api.get<AdminUserList>('/admin/users/', { params }),

  getUser: (id: string) => api.get<AdminUser>(`/admin/users/${id}/`),

  updateUser: (id: string, data: Partial<AdminUser>) =>
    api.patch<AdminUser>(`/admin/users/${id}/`, data),

  setCredits: (
    id: string,
    payload: { credits?: number; delta?: number; is_unlimited_credits?: boolean },
  ) => api.post<AdminUser>(`/admin/users/${id}/credits/`, payload),

  setActive: (id: string, is_active: boolean) =>
    api.post<AdminUser>(`/admin/users/${id}/set-active/`, { is_active }),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}/`),

  listJobHistory: (params?: {
    search?: string;
    page?: number;
    is_external?: string;
    is_purged?: string;
  }) => api.get<JobOfferHistoryList>('/admin/jobs/history/', { params }),
};
