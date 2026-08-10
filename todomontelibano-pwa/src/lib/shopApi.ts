import { api } from './api';
import type { ShopCategory, ShopCheckoutResponse, ShopOrder, ShopProduct } from '../types/shop';

export interface ProductListParams {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  in_stock?: boolean;
  page?: number;
  ordering?: string;
}

export const shopApi = {
  getCategories: () => api.get<ShopCategory[] | { results: ShopCategory[] }>('/ecommerce/categories/'),

  getProducts: (params?: ProductListParams) =>
    api.get<{ count: number; results: ShopProduct[] } | ShopProduct[]>('/ecommerce/products/', {
      params,
    }),

  getProduct: (slug: string) => api.get<ShopProduct>(`/ecommerce/products/${slug}/`),

  checkout: (payload: {
    items: Array<{ product_id: string; quantity: number }>;
    discount_code?: string;
  }) => api.post<ShopCheckoutResponse>('/ecommerce/orders/checkout/', payload),

  getMyOrders: () => api.get<ShopOrder[] | { results: ShopOrder[] }>('/ecommerce/orders/'),
};
