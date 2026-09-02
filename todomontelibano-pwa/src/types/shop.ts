export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}

export interface ShopProductDiscount {
  id: string;
  name: string;
  discount_type: string;
  discount_percentage?: string | null;
  discount_price?: string | null;
  start_time: string;
  end_time: string;
  is_flash_sale?: boolean;
}

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  sku?: string;
  price_cop: number | string;
  compare_at_price_cop?: number | string | null;
  stock: number;
  image_url?: string;
  is_featured?: boolean;
  category?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  subcategory?: string | null;
  subcategory_name?: string | null;
  subcategory_slug?: string | null;
  active_discount?: ShopProductDiscount | null;
  created_at?: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

export interface ShopOrder {
  id: string;
  status: string;
  subtotal_cop: number | string;
  discount_cop: number | string;
  total_cop: number | string;
  discount_code?: string;
  fulfilled: boolean;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price_cop: number | string;
    line_total_cop: number | string;
  }>;
  created_at: string;
}

export interface ShopCheckoutResponse {
  order: ShopOrder;
  preference_id: string;
  init_point?: string;
  sandbox_init_point?: string;
  is_production?: boolean;
}

export interface StoreSettings {
  id: string | null;
  store_logo: string;
  updated_at: string | null;
}
