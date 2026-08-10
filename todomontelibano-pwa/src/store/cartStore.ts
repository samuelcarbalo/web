import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, ShopProduct } from '../types/shop';

interface CartState {
  items: CartLine[];
  addItem: (product: ShopProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

const toNumber = (v: number | string | null | undefined) => Number(v || 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? {
                      ...i,
                      quantity: Math.min(i.stock, i.quantity + quantity),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unitPrice: toNumber(product.price_cop),
                quantity: Math.min(product.stock || 1, quantity),
                imageUrl: product.image_url,
                stock: product.stock,
              },
            ],
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    }),
    { name: 'capisj-shop-cart' },
  ),
);
