import { CartItem, Product } from '@/types/cart.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  selectedItems: Set<number>;
  isHydrated: boolean;

  // Actions
  syncFromServer: (serverItems: any[]) => void;
  addItemOptimistic: (item: Omit<CartItem, 'id'> & { id: number }) => void;
  updateQuantityOptimistic: (variantId: number, quantity: number) => void;
  removeItemOptimistic: (id: number) => void;
  getTotalPrice: () => number;
  replaceTempId: (tempId: number, realId: number) => void;

  // Selected items actions
  setSelectedItems: (items: Set<number>) => void;
  toggleSelectItem: (id: number) => void;
  selectAll: (checked: boolean, itemIds: number[]) => void;
  clearSelectedItems: () => void;
  clearCart: () => void;

  // Getters
  isSelectAll: () => boolean;
  getSelectedTotal: () => number;
}

const createEmptyProduct = (): Product => ({
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
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: new Set<number>(),
      isHydrated: false,

      // Sync items from server
      syncFromServer: (serverItems) => {
        const mapped: CartItem[] = serverItems.map((item: any) => {
          const productServer = item.variant?.product || {};

          // Clone sạch product
          const product: Product = {
            id: productServer.id || 0,
            tenantId: productServer.tenantId || 0,
            name: productServer.name || 'Sản phẩm không xác định',
            slug: productServer.slug || '',
            description: productServer.description || '',
            basePrice: productServer.basePrice || 0,
            thumb: productServer.thumb || '',
            images: productServer.images || [],
            status: productServer.status || 'ACTIVE',
            isPublished: productServer.isPublished ?? false,
            isFeatured: productServer.isFeatured ?? false,
            totalRatings: productServer.totalRatings || 0,
            totalReviews: productServer.totalReviews || 0,
            numberSold: productServer.numberSold || 0,
            categoryId: productServer.categoryId || 0,
            brandId: productServer.brandId || 0,
            createdById: productServer.createdById || 0,
            weight: productServer.weight || 0,
            length: productServer.length || 0,
            width: productServer.width || 0,
            height: productServer.height || 0,
            createdAt: productServer.createdAt || '',
            updatedAt: productServer.updatedAt || '',
            promotionProducts: Array.isArray(productServer.promotionProducts)
              ? [...productServer.promotionProducts]
              : [],
            seoTitle: productServer.seoTitle || '',
            seoDescription: productServer.seoDescription || '',
            seoKeywords: productServer.seoKeywords || '',
          };

          const basePrice = item.variant?.priceDelta ?? product.basePrice;

          const finalPrice = product.promotionProducts.length
            ? product.promotionProducts[0].discountType === 'PERCENT'
              ? basePrice * (1 - product.promotionProducts[0].discountValue / 100)
              : Math.max(0, basePrice - product.promotionProducts[0].discountValue)
            : basePrice;

          return {
            id: item.id,
            cartId: item.cartId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
            finalPrice,
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
            variant: {
              id: item.variant?.id || 0,
              productId: product.id,
              sku: item.variant?.sku || '',
              barcode: item.variant?.barcode || '',
              priceDelta: item.variant?.priceDelta || 0,
              price: item.variant?.price ?? null,
              attrValues: item.variant?.attrValues || {},
              thumb: item.variant?.thumb || null,
              warehouseId: item.variant?.warehouseId ?? null,
              product,
            },
          };
        });

        // Keep only valid selected items
        const currentSelected = get().selectedItems;
        const validSelected = new Set(
          mapped.filter((item) => currentSelected.has(item.id)).map((i) => i.id)
        );

        set({ items: mapped, selectedItems: validSelected, isHydrated: true });
      },

      addItemOptimistic: (newItem) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          newSelected.add(newItem.id);
          return { items: [...state.items, newItem], selectedItems: newSelected };
        }),

      updateQuantityOptimistic: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productVariantId === variantId
              ? { ...i, quantity, finalPrice: i.priceAtAdd * quantity }
              : i
          ),
        })),

      removeItemOptimistic: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          newSelected.delete(id);
          return {
            items: state.items.filter((i) => i.id !== id),
            selectedItems: newSelected,
          };
        }),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0),

      replaceTempId: (tempId, realId) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          if (newSelected.has(tempId)) {
            newSelected.delete(tempId);
            newSelected.add(realId);
          }
          return {
            items: state.items.map((i) => (i.id === tempId ? { ...i, id: realId } : i)),
            selectedItems: newSelected,
          };
        }),

      setSelectedItems: (items) => set({ selectedItems: items }),

      toggleSelectItem: (id) =>
        set((state) => {
          const newSelected = new Set(state.selectedItems);
          if (newSelected.has(id)) newSelected.delete(id);
          else newSelected.add(id);
          return { selectedItems: newSelected };
        }),

      selectAll: (checked, itemIds) =>
        set({ selectedItems: checked ? new Set(itemIds) : new Set() }),

      clearSelectedItems: () => set({ selectedItems: new Set() }),

      clearCart: () => {
        set({ items: [], selectedItems: new Set() });
        localStorage.removeItem('cart-storage');
      },

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
      version: 1,
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          variant: {
            ...item.variant,
            product: item.variant?.product ? { ...item.variant.product } : createEmptyProduct(),
          },
        })),
        selectedItems: Array.from(state.selectedItems),
      }),
      merge: (persistedState: any, currentState: CartStore): CartStore => {
        if (!persistedState) {
          return { ...currentState, isHydrated: true };
        }

        const selectedItems = persistedState?.selectedItems
          ? new Set<number>(persistedState.selectedItems)
          : new Set<number>();

        const items = persistedState?.items || [];

        // Ensure product exists in each item variant
        const validatedItems: CartItem[] = items.map((item: any) => ({
          ...item,
          variant: {
            ...item.variant,
            product: item.variant?.product || createEmptyProduct(),
          },
        }));

        return {
          ...currentState,
          items: validatedItems,
          selectedItems,
          isHydrated: true,
        };
      },
    }
  )
);