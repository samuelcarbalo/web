import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { shopApi, type ProductListParams } from '../lib/shopApi';
import type { ShopCategory, ShopOrder, ShopProduct, StoreSettings } from '../types/shop';

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

export const useShopProducts = (params?: ProductListParams) =>
  useQuery({
    queryKey: shopKeys.products(params),
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
  });

export const useShopProduct = (slug?: string) =>
  useQuery({
    queryKey: shopKeys.product(slug || ''),
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

export const useShopCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shopApi.checkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.orders() });
    },
  });
};

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
