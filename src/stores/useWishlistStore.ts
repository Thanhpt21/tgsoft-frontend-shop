// src/stores/useWishlistStore.ts
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { WishlistItem, WishlistState } from '@/types/wishlist.type';

const WISHLIST_COOKIE_KEY = 'userWishlist';

const loadWishlistFromCookie = (): WishlistItem[] => {
  try {
    const wishlistData = Cookies.get(WISHLIST_COOKIE_KEY);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error("Error loading wishlist from cookie:", error);
    return [];
  }
};

const saveWishlistToCookie = (items: WishlistItem[]) => {
  try {
    // Lưu cookie trong 30 ngày. Điều chỉnh expires nếu cần.
    Cookies.set(WISHLIST_COOKIE_KEY, JSON.stringify(items), { expires: 30 });
  } catch (error) {
    console.error("Error saving wishlist to cookie:", error);
  }
};

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isHydrated: false,

  // Hydrate the store from cookie on client-side
  hydrate: () => {
    // Chỉ hydrate nếu chưa được hydrate
    if (!get().isHydrated) {
      const wishlistFromCookie = loadWishlistFromCookie();
      set({ items: wishlistFromCookie, isHydrated: true });
    }
  },

  // Add an item to the wishlist
  addItem: (product) => {
    set((state) => {
      // Check if item already exists
      const existingItem = state.items.find((item) => item.id === product.id);

      if (!existingItem) {
        const updatedItems = [...state.items, product];
        saveWishlistToCookie(updatedItems);
        return { items: updatedItems };
      }
      return state; // No change if item already exists
    });
  },

  // Remove an item from the wishlist
  removeItem: (productId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== productId);
      saveWishlistToCookie(updatedItems);
      return { items: updatedItems };
    });
  },

  // Check if an item is in the wishlist
  isInWishlist: (productId) => {
    return get().items.some((item) => item.id === productId);
  },

  // Toggle (add/remove) an item in the wishlist
  toggleItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let updatedItems: WishlistItem[];

      if (existingItem) {
        // Remove if exists
        updatedItems = state.items.filter((item) => item.id !== product.id);
      } else {
        // Add if not exists
        updatedItems = [...state.items, product];
      }
      saveWishlistToCookie(updatedItems);
      return { items: updatedItems };
    });
  },
}));

// Hook to use the wishlist store, ensuring hydration
export const useWishlist = () => {
  const store = useWishlistStore();

  useEffect(() => {
    // Hydrate the store when the component mounts on the client-side
    // This ensures data from cookies is loaded into state
    store.hydrate();
  }, [store.hydrate]); // Re-run if hydrate function reference changes (unlikely for a Zustand store)

  return store;
};

export default useWishlist;