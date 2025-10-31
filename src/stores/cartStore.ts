// src/stores/cartStore.ts
import { CartItem } from '@/types/cart.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


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
        const mapped: CartItem[] = serverItems.map((item: any) => ({
          id: item.id,
          cartId: item.cartId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
          warehouseId: item.warehouseId || null,
          variant: {
            id: item.variant?.id || 0,
            sku: item.variant?.sku || '',
            priceDelta: item.variant?.priceDelta || 0,
            attrValues: item.variant?.attrValues || {},
            thumb: item.variant?.thumb || null,
            warehouseId: item.variant?.warehouseId || null,
            product: {
              id: item.variant?.product?.id || 0,
              name: item.variant?.product?.name || 'Sản phẩm',
              basePrice: item.variant?.product?.basePrice || 0,
              thumb: item.variant?.product?.thumb || '',
              weight: item.variant?.product?.weight || 0, 
            },
          },
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
