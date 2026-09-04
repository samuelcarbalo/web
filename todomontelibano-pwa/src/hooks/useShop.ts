import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { shopApi, type ProductListParams } from '../lib/shopApi';
import { useAuthStore } from '../store/authStore';
import type { ShopCategory, ShopCheckoutBreakdown, ShopOrder, ShopProduct, StoreSettings } from '../types/shop';

function normalizeList<T>(data: T[] | { results: T[] } | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export const shopKeys = {
  all: ['shop'] as const,
  categories: () => [...shopKeys.all, 'categories'] as const,
  products: (params?: ProductListParams) => [...shopKeys.all, 'products', params] as const,
  product: (slug: string) => [...shopKeys.all, 'product', slug] as const,
  orders: () => [...shopKeys.all, 'orders'] as const,
  settings: () => [...shopKeys.all, 'settings'] as const,
  checkoutQuote: (itemsKey: string, discountCode: string) =>
    [...shopKeys.all, 'checkout-quote', itemsKey, discountCode] as const,
};

export const useShopCategories = () =>
  useQuery({
    queryKey: shopKeys.categories(),
    queryFn: async () => {
      const soft = await shopApi.getCategories();
      return {
        items: normalizeList<ShopCategory>(
          soft.data as ShopCategory[] | { results: ShopCategory[] },
        ),
        warning: soft.warning,
        degraded: soft.degraded,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });

export const useShopProducts = (params?: ProductListParams, options?: { enabled?: boolean }) => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: [...shopKeys.products(params), userId ?? 'anon'],
    queryFn: async () => {
      const soft = await shopApi.getProducts(params);
      if (Array.isArray(soft.data)) {
        return {
          count: soft.data.length,
          results: soft.data as ShopProduct[],
          warning: soft.warning,
          degraded: soft.degraded,
        };
      }
      const payload = soft.data as { count: number; results: ShopProduct[] };
      return {
        count: payload.count ?? 0,
        results: payload.results ?? [],
        warning: soft.warning,
        degraded: soft.degraded,
      };
    },
    staleTime: 60 * 1000,
    retry: false,
    throwOnError: false,
    enabled: options?.enabled ?? true,
  });
};

export const useShopProduct = (slug?: string) => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: [...shopKeys.product(slug || ''), userId ?? 'anon'],
    queryFn: async () => {
      const soft = await shopApi.getProduct(slug!);
      return {
        product: soft.data,
        warning: soft.warning,
        degraded: soft.degraded,
      };
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
    retry: false,
    throwOnError: false,
  });
};

export const useUpdateShopProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Partial<ShopProduct> & Record<string, unknown>;
    }) => shopApi.updateProduct(slug, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: shopKeys.all });
      void qc.invalidateQueries({ queryKey: shopKeys.product(vars.slug) });
    },
  });
};

export const useDeleteShopProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => shopApi.deleteProduct(slug),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shopKeys.all });
    },
  });
};

export const useUpdateShopProductStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: { is_published?: boolean; is_active?: boolean; stock?: number };
    }) => shopApi.updateProductStatus(slug, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: shopKeys.all });
      void qc.invalidateQueries({ queryKey: shopKeys.product(vars.slug) });
    },
  });
};

export const useShopCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shopApi.checkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.orders() });
    },
  });
};

export const useShopCheckoutQuote = (
  items: Array<{ product_id: string; quantity: number }>,
  discountCode: string,
  enabled = true,
) =>
  useQuery({
    queryKey: shopKeys.checkoutQuote(
      items.map((i) => `${i.product_id}:${i.quantity}`).join(','),
      discountCode.trim().toUpperCase(),
    ),
    queryFn: async () => {
      const { data } = await shopApi.quoteCheckout({
        items,
        discount_code: discountCode.trim() || undefined,
      });
      return data as ShopCheckoutBreakdown;
    },
    enabled: enabled && items.length > 0,
    staleTime: 15 * 1000,
    retry: false,
  });

export const useMyShopOrders = (enabled = true) =>
  useQuery({
    queryKey: shopKeys.orders(),
    queryFn: async () => {
      const { data } = await shopApi.getMyOrders();
      return normalizeList<ShopOrder>(data as ShopOrder[] | { results: ShopOrder[] });
    },
    enabled,
    staleTime: 30 * 1000,
  });

export const useShopSales = (
  params?: {
    status?: string;
    delivery_status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: [...shopKeys.orders(), 'sales', params],
    queryFn: async () => {
      const { data } = await shopApi.getSales(params);
      if (Array.isArray(data)) return { count: data.length, results: data };
      return { count: data.count ?? data.results?.length ?? 0, results: data.results ?? [] };
    },
    enabled,
    staleTime: 20_000,
  });

export const useShopSalesMetrics = (
  params?: { date_from?: string; date_to?: string },
  enabled = true,
) =>
  useQuery({
    queryKey: [...shopKeys.orders(), 'metrics', params],
    queryFn: async () => {
      const { data } = await shopApi.getSalesMetrics(params);
      return data;
    },
    enabled,
    staleTime: 20_000,
  });

export const useUpdateDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delivery_status }: { id: string; delivery_status: string }) =>
      shopApi.updateDelivery(id, delivery_status).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.orders() });
    },
  });
};

export const useShopSettings = () =>
  useQuery({
    queryKey: shopKeys.settings(),
    queryFn: async () => {
      const soft = await shopApi.getSettings();
      return {
        settings: soft.data,
        warning: soft.warning,
        degraded: soft.degraded,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });

function cacheStoreSettings(qc: QueryClient, settings: StoreSettings) {
  qc.setQueryData(shopKeys.settings(), {
    settings,
    warning: undefined,
    degraded: false,
  });
}

export const useUpdateStoreSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { store_logo?: string; shipping_cost_cop?: number | string }) => {
      const { data } = await shopApi.updateSettings(payload);
      return data;
    },
    onSuccess: (data) => {
      cacheStoreSettings(qc, data);
      void qc.invalidateQueries({ queryKey: shopKeys.settings() });
    },
  });
};

export const useUpdateStoreLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (store_logo: string) => {
      const { data } = await shopApi.uploadLogo({ store_logo });
      return data;
    },
    onSuccess: (data) => {
      cacheStoreSettings(qc, data);
      void qc.invalidateQueries({ queryKey: shopKeys.settings() });
    },
  });
};

export const useDeleteStoreLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await shopApi.deleteLogo();
      return data;
    },
    onSuccess: (data) => {
      cacheStoreSettings(qc, data);
      void qc.invalidateQueries({ queryKey: shopKeys.settings() });
    },
  });
};
