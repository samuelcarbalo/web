import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '../lib/adminApi';

export const adminKeys = {
  all: ['admin-users'] as const,
  list: (params: object) => [...adminKeys.all, 'list', params] as const,
};

export const useAdminUsers = (params: { search?: string; page?: number; is_active?: string }) =>
  useQuery({
    queryKey: adminKeys.list(params),
    queryFn: async () => {
      const { data } = await adminApi.listUsers(params);
      return data;
    },
  });

export const useUpdateAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      adminApi.updateUser(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
};

export const useSetAdminCredits = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { credits?: number; delta?: number; is_unlimited_credits?: boolean };
    }) => adminApi.setCredits(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
};

export const useSetAdminActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminApi.setActive(id, is_active).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
};

export const useDeleteAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
};
