import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, moderationApi } from '../lib/paymentsApi';
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
    staleTime: Infinity,
  });

export const useCreatePreference = () =>
  useMutation({
    mutationFn: (packageId: string) => paymentsApi.createPreference(packageId).then((r) => r.data),
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
  };
};
