// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  productVariantId: number;
  quantity: number;
  priceAtAdd: number;
  productName: string;
  thumb: string;
  attributes: Record<string, string>;
}

interface CartStore {
  items: CartItem[];
  syncFromServer: (serverItems: any[]) => void;
  addItemOptimistic: (item: Omit<CartItem, 'id'> & { id: number }) => void;
  updateQuantityOptimistic: (variantId: number, quantity: number) => void;
  removeItemOptimistic: (id: number) => void;
  getTotalPrice: () => number;
  replaceTempId: (tempId: number, realId: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      syncFromServer: (serverItems) => {
        const mapped = serverItems.map((item: any) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
          productName: item.variant?.product?.name || 'Sản phẩm',
          thumb: item.variant?.thumb || item.variant?.product?.thumb || '/placeholder.jpg',
          attributes: item.variant?.attrValues
            ? Object.fromEntries(
                Object.entries(item.variant.attrValues).map(([k, v]: [string, any]) => [k, String(v)])
              )
            : {},
        }));
        set({ items: mapped });
      },

      // NHẬN id từ hook, KHÔNG TỰ TẠO
      addItemOptimistic: (newItem) => {
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateQuantityOptimistic: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === variantId ? { ...i, quantity } : i
          ),
        })),

      // XÓA BẰNG ID (tempId hoặc realId)
      removeItemOptimistic: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0),

      replaceTempId: (tempId, realId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === tempId ? { ...i, id: realId } : i
          ),
        })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Chỉ lưu items
    }
  )
);
