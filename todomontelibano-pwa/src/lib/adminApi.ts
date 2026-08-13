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
};
