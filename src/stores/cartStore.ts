// src/stores/cartStore.ts
import { CartItem } from '@/types/cart.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  selectedItems: Set<number>;

  // Actions
  syncFromServer: (serverItems: any[]) => void;
  addItemOptimistic: (item: Omit<CartItem, 'id'> & { id: number }) => void;
  updateQuantityOptimistic: (variantId: number, quantity: number) => void;
  removeItemOptimistic: (id: number) => void;
  getTotalPrice: () => number;
  replaceTempId: (tempId: number, realId: number) => void;

  // Selected Items
  setSelectedItems: (items: Set<number>) => void;
  toggleSelectItem: (id: number) => void;
  selectAll: (checked: boolean, itemIds: number[]) => void;
  clearSelectedItems: () => void;

  // Getter
  isSelectAll: () => boolean;
  getSelectedTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: new Set<number>(),

      // === Sync từ server ===
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

        const currentSelected = get().selectedItems;
        const validSelected = new Set(
          mapped
            .filter((item) => currentSelected.has(item.id))
            .map((item) => item.id)
        );

        set({ items: mapped, selectedItems: validSelected });
      },

      // === Thêm sản phẩm ===
      addItemOptimistic: (newItem) => {
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          newSelected.add(newItem.id);
          return {
            items: [...state.items, newItem],
            selectedItems: newSelected,
          };
        });
      },

      // === Cập nhật số lượng ===
      updateQuantityOptimistic: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === variantId ? { ...i, quantity } : i
          ),
        })),

      // === Xóa sản phẩm ===
      removeItemOptimistic: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          newSelected.delete(id);
          return {
            items: state.items.filter((i) => i.id !== id),
            selectedItems: newSelected,
          };
        }),

      // === Tổng tiền toàn bộ ===
      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0),

      // === Thay ID tạm bằng ID thật ===
      replaceTempId: (tempId, realId) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          if (newSelected.has(tempId)) {
            newSelected.delete(tempId);
            newSelected.add(realId);
          }
          return {
            items: state.items.map((i) =>
              i.id === tempId ? { ...i, id: realId } : i
            ),
            selectedItems: newSelected,
          };
        }),

      // === Selected Items Actions ===
      setSelectedItems: (items) => set({ selectedItems: items }),

      toggleSelectItem: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
          return { selectedItems: newSelected };
        }),

      selectAll: (checked, itemIds) =>
        set({
          selectedItems: checked ? new Set(itemIds) : new Set(),
        }),

      clearSelectedItems: () => set({ selectedItems: new Set() }),

      // === Getters ===
      isSelectAll: () => {
        const { items, selectedItems } = get();
        return items.length > 0 && items.every((item) => selectedItems.has(item.id));
      },

      getSelectedTotal: () => {
        const { items, selectedItems } = get();
        return items
          .filter((item) => selectedItems.has(item.id))
          .reduce((total, item) => total + item.priceAtAdd * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        selectedItems: Array.from(state.selectedItems),
      }),
      merge: (persistedState: any, currentState) => {
        const selected = persistedState.selectedItems
          ? new Set(persistedState.selectedItems)
          : new Set<number>();

        return {
          ...currentState,
          ...persistedState,
          selectedItems: selected,
        };
      },
    }
  )
);