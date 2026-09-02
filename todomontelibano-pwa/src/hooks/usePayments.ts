import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, moderationApi, type MpAdminConfigUpdate } from '../lib/paymentsApi';
import { FALLBACK_PACKAGES, type CreditPackage } from '../config/credits';

function normalizePackages(data: unknown): CreditPackage[] {
  if (Array.isArray(data) && data.length > 0) {
    return data as CreditPackage[];
  }
  // Por si DRF u otro middleware devuelve respuesta paginada
  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    const results = (data as { results: CreditPackage[] }).results;
    if (results.length > 0) return results;
  }
  return FALLBACK_PACKAGES;
}

export const useCreditPackages = () =>
  useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      try {
        const { data } = await paymentsApi.getPackages();
        return normalizePackages(data);
      } catch {
        // Si el backend no responde, mantener catálogo local visible
        return FALLBACK_PACKAGES;
      }
    },
    staleTime: 1000 * 60 * 10,
    initialData: FALLBACK_PACKAGES,
    retry: 1,
  });

export const useMpConfig = () =>
  useQuery({
    queryKey: ['mp-config'],
    queryFn: async () => {
      const { data } = await paymentsApi.getMpConfig();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

export const useMpAdminConfig = (enabled = true) =>
  useQuery({
    queryKey: ['mp-admin-config'],
    queryFn: async () => {
      const { data } = await paymentsApi.getMpAdminConfig();
      return data;
    },
    enabled,
    staleTime: 1000 * 30,
    retry: 1,
  });

export const useUpdateMpAdminConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MpAdminConfigUpdate) =>
      paymentsApi.updateMpAdminConfig(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp-admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['mp-config'] });
    },
  });
};

export const useCreatePreference = () =>
  useMutation({
    mutationFn: (packageId: string) => paymentsApi.createPreference(packageId).then((r) => r.data),
  });

export interface PaymentOrderRow {
  id: string;
  package_id: string;
  credits_amount: number;
  amount_cop: string | number;
  status: string;
  credits_applied: boolean;
  created_at: string;
}

export const useMyPaymentOrders = (enabled = true) =>
  useQuery({
    queryKey: ['payment-orders'],
    queryFn: async () => {
      const { data } = await paymentsApi.getMyOrders();
      return (Array.isArray(data) ? data : []) as PaymentOrderRow[];
    },
    enabled,
    staleTime: 15000,
  });

export const useReportPublication = () =>
  useMutation({
    mutationFn: moderationApi.reportPublication,
  });

export const useRefreshCreditsAfterPayment = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['payment-orders'] });
    // El webhook crea Notification(payment_*); refrescar campana/historial
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };
};
