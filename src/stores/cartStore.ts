// // src/stores/cartStore.js
// import { create } from 'zustand';
// import Cookies from 'js-cookie';
// import { useEffect } from 'react';
// import { CartItem, CartState } from '@/types/cart.type'; // Import từ file types

// const CART_COOKIE_KEY = 'shoppingCart';

// const loadCartFromCookie = (): CartItem[] => {
//   try {
//     const cartData = Cookies.get(CART_COOKIE_KEY);
//     return cartData ? JSON.parse(cartData) : [];
//   } catch (error) {
//     console.error("Lỗi khi đọc cookie giỏ hàng:", error);
//     return [];
//   }
// };

// const saveCartToCookie = (items: CartItem[]) => {
//   try {
//     Cookies.set(CART_COOKIE_KEY, JSON.stringify(items), { expires: 7 });
//   } catch (error) {
//     console.error("Lỗi khi lưu cookie giỏ hàng:", error);
//   }
// };

// const useCartStore = create<CartState>((set, get) => ({
//   items: [],
//   isHydrated: false,

//   hydrate: () => {
//     const cartFromCookie = loadCartFromCookie();
//     set({ items: cartFromCookie, isHydrated: true });
//   },

//   addItem: (itemData) => {
//     set((state) => {
//       const {
//         productId,
//         variantId,
//         thumb,
//         title,
//         price,
//         discount,
//         color,
//         size,
//         quantity = 1,
//       } = itemData;

//       const discountedPrice = discount && discount > 0 ? price - discount : undefined;

//       const numericalColorId = color?.id ? Number(color.id) : undefined;
//       const numericalSizeId = size?.id ? Number(size.id) : undefined;

//       // Tạo ID tổng hợp duy nhất cho mục trong giỏ hàng
//       const cartItemId = `${productId}-${numericalColorId || 'no-color'}-${numericalSizeId || 'no-size'}-${variantId || 'no-variant'}`;

//       const newItem: CartItem = {
//         id: cartItemId, // Gán ID tổng hợp vào CartItem.id
//         productId: productId,
//         variantId: variantId,
//         colorId: numericalColorId,
//         sizeId: numericalSizeId,
//         thumb: thumb,
//         title: title,
//         price: price,
//         discountedPrice: discountedPrice,
//         selectedColor: color,
//         selectedSizeId: size?.id,
//         selectedSizeTitle: size?.title,
//         quantity: quantity,
//       };

//       // Tìm kiếm mục hiện có dựa trên productId, colorId, sizeId, variantId
//       const existingItem = state.items.find(
//         (i) =>
//           i.productId === newItem.productId &&
//           i.colorId === newItem.colorId &&
//           i.sizeId === newItem.sizeId &&
//           i.variantId === newItem.variantId
//       );

//       let updatedItems: CartItem[];
//       if (existingItem) {
//         updatedItems = state.items.map((i) =>
//           (i.productId === newItem.productId &&
//             i.colorId === newItem.colorId &&
//             i.sizeId === newItem.sizeId &&
//             i.variantId === newItem.variantId)
//             ? { ...i, quantity: i.quantity + newItem.quantity }
//             : i
//         );
//       } else {
//         updatedItems = [...state.items, newItem];
//       }

//       saveCartToCookie(updatedItems);
//       return { items: updatedItems };
//     });
//   },

//   removeItem: (cartItemId) => { // Chỉ nhận cartItemId
//     set((state) => {
//       const updatedItems = state.items.filter((item) => item.id !== cartItemId);
//       saveCartToCookie(updatedItems);
//       return { items: updatedItems };
//     });
//   },

//   increaseItemQuantity: (cartItemId) => { // Chỉ nhận cartItemId
//     set((state) => {
//       const updatedItems = state.items.map((item) =>
//         item.id === cartItemId
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       );
//       saveCartToCookie(updatedItems);
//       return { items: updatedItems };
//     });
//   },

//   decreaseItemQuantity: (cartItemId) => { // Chỉ nhận cartItemId
//     set((state) => {
//       const updatedItems = state.items.map((item) =>
//         item.id === cartItemId
//           ? { ...item, quantity: Math.max(1, item.quantity - 1) }
//           : item
//       );
//       saveCartToCookie(updatedItems);
//       return { items: updatedItems };
//     });
//   },

//   clearCart: () => {
//     set({ items: [] as CartItem[] });
//     Cookies.remove(CART_COOKIE_KEY);
//   },

//   getTotalPrice: () => {
//     return get().items.reduce((total, item) => {
//       const priceToUse = item.discountedPrice !== undefined ? item.discountedPrice : item.price;
//       return total + priceToUse * item.quantity;
//     }, 0);
//   },
// }));

// export const useCart = () => {
//   const store = useCartStore();
//   useEffect(() => {
//     store.hydrate();
//   }, [store.hydrate]);

//   return store;
// };

// export default useCart;