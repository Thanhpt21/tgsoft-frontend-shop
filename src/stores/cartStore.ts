import { CartItem } from '@/types/cart.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  selectedItems: Set<number>;

  // Các hành động
  syncFromServer: (serverItems: any[]) => void;
  addItemOptimistic: (item: Omit<CartItem, 'id'> & { id: number }) => void;
  updateQuantityOptimistic: (variantId: number, quantity: number) => void;
  removeItemOptimistic: (id: number) => void;
  getTotalPrice: () => number;
  replaceTempId: (tempId: number, realId: number) => void;

  // Các hành động với sản phẩm chọn
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

      syncFromServer: (serverItems) => {
  const mapped: CartItem[] = serverItems.map((item: any) => {
    // Đảm bảo các trường của sản phẩm có giá trị mặc định nếu thiếu
    const product = item.variant?.product || {
      id: 0,
      tenantId: 0,
      name: 'Sản phẩm không xác định',
      slug: '',
      description: '',
      basePrice: 0,
      thumb: '',
      images: [],
      status: 'ACTIVE',
      isPublished: false,
      isFeatured: false,
      totalRatings: 0,
      totalReviews: 0,
      numberSold: 0,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      categoryId: 0,
      brandId: 0,
      createdById: 0,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      createdAt: '',
      updatedAt: '',
      promotionProducts: [],
    };

    // Tính giá giảm sau khi áp dụng khuyến mãi
    const getDiscountedPrice = () => {
      if (!product.promotionProducts?.length) return null;

      const promo = product.promotionProducts[0];
      const basePrice = item.variant?.priceDelta || product.basePrice;

      if (promo.discountType === 'PERCENT') {
        return basePrice * (1 - promo.discountValue / 100);
      }
      if (promo.discountType === 'FIXED') {
        return Math.max(0, basePrice - promo.discountValue);
      }

      return null;
    };

    const discountedPrice = getDiscountedPrice();
    const finalPrice = discountedPrice ?? discountedPrice ?? item.variant?.priceDelta;

    return {
      id: item.id,
      cartId: item.cartId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      finalPrice: finalPrice,  // Tính toán finalPrice ngay tại đây
      createdAt: item.createdAt || '',
      updatedAt: item.updatedAt || '',
      variant: {
        id: item.variant?.id || 0,
        productId: item.variant?.product?.id || 0,
        sku: item.variant?.sku || '',
        barcode: item.variant?.barcode || '',
        priceDelta: item.variant?.priceDelta || 0,
        price: item.variant?.price || null,
        attrValues: item.variant?.attrValues || {},
        thumb: item.variant?.thumb || null,
        warehouseId: item.variant?.warehouseId || null,
        product: product, // Sử dụng dữ liệu đã chuẩn hóa ở trên
      },
    };
  });

  const currentSelected = get().selectedItems;
  const validSelected = new Set(
    mapped
      .filter((item) => currentSelected.has(item.id))
      .map((item) => item.id)
  );

  set({ items: mapped, selectedItems: validSelected });
}
,

      // === Thêm sản phẩm vào giỏ hàng (tạm thời) ===
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

      // === Cập nhật số lượng sản phẩm ===
      updateQuantityOptimistic: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === variantId
              ? { ...i, quantity, finalPrice: i.priceAtAdd * quantity }
              : i
          ),
        })),

      // === Xóa sản phẩm khỏi giỏ ===
      removeItemOptimistic: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          newSelected.delete(id);
          return {
            items: state.items.filter((i) => i.id !== id),
            selectedItems: newSelected,
          };
        }),

      // === Tính tổng tiền giỏ hàng (bao gồm khuyến mãi) ===
      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.finalPrice * i.quantity,
          0
        ),

      // === Thay thế ID tạm thời bằng ID thật ===
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

      // === Các hành động với sản phẩm được chọn ===
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

      // === Các getter ===
      isSelectAll: () => {
        const { items, selectedItems } = get();
        return items.length > 0 && items.every((item) => selectedItems.has(item.id));
      },

      getSelectedTotal: () => {
        const { items, selectedItems } = get();
        return items
          .filter((item) => selectedItems.has(item.id))
          .reduce((total, item) => total + item.finalPrice * item.quantity, 0);
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
