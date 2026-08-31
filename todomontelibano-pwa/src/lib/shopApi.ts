import axios, { type AxiosError } from 'axios';
import { api } from './api';
import type { ShopCategory, ShopCheckoutResponse, ShopOrder, ShopProduct } from '../types/shop';

export interface ProductListParams {
  category?: string;
  category_id?: string;
  subcategory?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  in_stock?: boolean;
  flash_sale?: boolean;
  page?: number;
  ordering?: string;
}

export type SoftListResult<T> = {
  data: T;
  warning?: string;
  degraded: boolean;
};

function isServerError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = (error as AxiosError).response?.status;
  return typeof status === 'number' && status >= 500;
}

function serverErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Error de red al cargar el catálogo';
  const data = error.response?.data as { error?: string; detail?: string } | undefined;
  if (typeof data?.error === 'string' && data.error) return data.error;
  if (typeof data?.detail === 'string' && data.detail) return data.detail;
  return `El servidor respondió ${error.response?.status ?? 'error'}`;
}

/**
 * Cliente ecommerce: ante HTTP >= 500 no rompe la UI; degrada a lista vacía + warning.
 */
export const shopApi = {
  getCategories: async (): Promise<SoftListResult<ShopCategory[] | { results: ShopCategory[] }>> => {
    try {
      const { data } = await api.get<ShopCategory[] | { results: ShopCategory[] }>(
        '/ecommerce/categories/',
      );
      return { data, degraded: false };
    } catch (error) {
      if (isServerError(error)) {
        console.warn('[shopApi] categories degraded:', serverErrorMessage(error));
        return {
          data: { count: 0, results: [] } as unknown as { results: ShopCategory[] },
          warning: 'No se pudo cargar el catálogo en este momento',
          degraded: true,
        };
      }
      throw error;
    }
  },

  getProducts: async (
    params?: ProductListParams,
  ): Promise<SoftListResult<{ count: number; results: ShopProduct[] } | ShopProduct[]>> => {
    try {
      const { data } = await api.get<{ count: number; results: ShopProduct[] } | ShopProduct[]>(
        '/ecommerce/products/',
        { params },
      );
      return { data, degraded: false };
    } catch (error) {
      if (isServerError(error)) {
        console.warn('[shopApi] products degraded:', serverErrorMessage(error));
        return {
          data: { count: 0, results: [] },
          warning: 'No se pudo cargar el catálogo en este momento',
          degraded: true,
        };
      }
      throw error;
    }
  },

  getProduct: async (slug: string): Promise<SoftListResult<ShopProduct | null>> => {
    try {
      const { data } = await api.get<ShopProduct>(`/ecommerce/products/${slug}/`);
      return { data, degraded: false };
    } catch (error) {
      if (isServerError(error)) {
        console.warn('[shopApi] product degraded:', serverErrorMessage(error));
        return {
          data: null,
          warning: 'No se pudo cargar este producto en este momento',
          degraded: true,
        };
      }
      throw error;
    }
  },

  checkout: (payload: {
    items: Array<{ product_id: string; quantity: number }>;
    discount_code?: string;
  }) => api.post<ShopCheckoutResponse>('/ecommerce/orders/checkout/', payload),

  getMyOrders: () => api.get<ShopOrder[] | { results: ShopOrder[] }>('/ecommerce/orders/'),
};
