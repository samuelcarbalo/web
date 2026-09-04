import axios, { type AxiosError } from 'axios';
import { api } from './api';
import type { ShopCategory, ShopCheckoutBreakdown, ShopCheckoutResponse, ShopOrder, ShopProduct, ShopSalesMetrics, StoreSettings } from '../types/shop';

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
  mine?: boolean;
  my_products?: boolean;
  created_by_me?: boolean;
  created_by?: string;
  manage?: boolean;
  all?: boolean;
}

export type SoftListResult<T> = {
  data: T;
  warning?: string;
  degraded: boolean;
};

/** Límites Plan Free (alineados con backend ecommerce.batch_import). */
export const SHOP_BATCH_MAX_BYTES = 2 * 1024 * 1024;
export const SHOP_BATCH_MAX_ROWS = 200;

export const PRODUCT_IMPORT_HEADERS = [
  'name',
  'sku',
  'description',
  'short_description',
  'category',
  'subcategory',
  'price_cop',
  'compare_at_price_cop',
  'stock',
  'image_url',
  'is_featured',
  'is_published',
] as const;

export type ProductBatchImportResult = {
  status?: string;
  success?: boolean;
  message?: string;
  created: number;
  updated: number;
  error_count: number;
  errors: Array<{ row: number; field?: string | null; message: string }>;
  max_rows?: number;
  max_bytes?: number;
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
      const query = { ...params };
      if (query.mine || query.my_products || query.created_by_me) {
        query.created_by_me = true;
      }
      const { data } = await api.get<{ count: number; results: ShopProduct[] } | ShopProduct[]>(
        '/ecommerce/products/',
        { params: query },
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

  updateProduct: (slug: string, payload: Partial<ShopProduct> & Record<string, unknown>) =>
    api.patch<ShopProduct>(`/ecommerce/products/${slug}/`, payload),

  deleteProduct: (slug: string) => api.delete(`/ecommerce/products/${slug}/`),

  updateProductStatus: (
    slug: string,
    payload: { is_published?: boolean; is_active?: boolean; stock?: number },
  ) => api.patch<ShopProduct>(`/ecommerce/products/${slug}/status/`, payload),

  downloadProductImportTemplate: async (format: 'xlsx' | 'csv' = 'xlsx') => {
    const response = await api.get(`/ecommerce/products/import-template/`, {
      params: { format },
      responseType: 'blob',
    });
    const type =
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([response.data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      format === 'csv'
        ? 'chever_plantilla_productos.csv'
        : 'chever_plantilla_productos.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },

  uploadProductImportBatch: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ProductBatchImportResult>(
      '/ecommerce/products/import-batch/',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  checkout: (payload: {
    items: Array<{ product_id: string; quantity: number }>;
    discount_code?: string;
  }) => api.post<ShopCheckoutResponse>('/ecommerce/orders/checkout/', payload),

  quoteCheckout: (payload: {
    items: Array<{ product_id: string; quantity: number }>;
    discount_code?: string;
  }) => api.post<ShopCheckoutBreakdown>('/ecommerce/orders/quote/', payload),

  getMyOrders: () => api.get<ShopOrder[] | { results: ShopOrder[] }>('/ecommerce/orders/'),

  getOrder: (id: string) => api.get<ShopOrder>(`/ecommerce/orders/${id}/`),

  getSales: (params?: {
    status?: string;
    delivery_status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }) =>
    api.get<ShopOrder[] | { count: number; results: ShopOrder[] }>('/ecommerce/orders/sales/', {
      params,
    }),

  getSalesMetrics: (params?: { date_from?: string; date_to?: string }) =>
    api.get<ShopSalesMetrics>('/ecommerce/orders/metrics/', { params }),

  updateDelivery: (id: string, delivery_status: string) =>
    api.patch<ShopOrder>(`/ecommerce/orders/${id}/delivery/`, { delivery_status }),

  getSettings: async (): Promise<SoftListResult<StoreSettings>> => {
    try {
      const { data } = await api.get<StoreSettings>('/store/settings/');
      return {
        data: {
          id: data?.id ?? null,
          store_logo: data?.store_logo ?? '',
          shipping_cost_cop: data?.shipping_cost_cop ?? 0,
          updated_at: data?.updated_at ?? null,
        },
        degraded: false,
      };
    } catch (error) {
      console.warn('[shopApi] store settings degraded:', serverErrorMessage(error));
      return {
        data: { id: null, store_logo: '', shipping_cost_cop: 0, updated_at: null },
        warning: 'No se pudo cargar la configuración visual de la tienda',
        degraded: true,
      };
    }
  },

  updateSettings: (payload: { store_logo?: string; shipping_cost_cop?: number | string }) =>
    api.patch<StoreSettings>('/store/settings/', payload),

  uploadLogo: (payload: { store_logo: string }) =>
    api.post<StoreSettings>('/store/logo/', payload),

  deleteLogo: () => api.delete<StoreSettings>('/store/logo/'),
};

export async function downloadProductImportTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  return shopApi.downloadProductImportTemplate(format);
}

export async function uploadProductImportBatch(file: File) {
  return shopApi.uploadProductImportBatch(file);
}
