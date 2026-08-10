import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi, type ProductListParams } from '../lib/shopApi';
import type { ShopCategory, ShopProduct } from '../types/shop';

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
};

export const useShopCategories = () =>
  useQuery({
    queryKey: shopKeys.categories(),
    queryFn: async () => {
      const { data } = await shopApi.getCategories();
      return normalizeList<ShopCategory>(data as ShopCategory[] | { results: ShopCategory[] });
    },
    staleTime: 5 * 60 * 1000,
  });

export const useShopProducts = (params?: ProductListParams) =>
  useQuery({
    queryKey: shopKeys.products(params),
    queryFn: async () => {
      const { data } = await shopApi.getProducts(params);
      if (Array.isArray(data)) {
        return { count: data.length, results: data as ShopProduct[] };
      }
      return data as { count: number; results: ShopProduct[] };
    },
    staleTime: 60 * 1000,
  });

export const useShopProduct = (slug?: string) =>
  useQuery({
    queryKey: shopKeys.product(slug || ''),
    queryFn: async () => {
      const { data } = await shopApi.getProduct(slug!);
      return data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
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
