export type WishlistItem = {
  id: number; // ID sản phẩm
  slug: string; // Slug của sản phẩm để tạo Link
  title: string;
  thumb: string;
  price: number;
  discount?: number; // Optional discount
  averageRating?: number; // Optional
  ratingCount?: number; // Optional
  // Có thể thêm các trường khác nếu bạn muốn hiển thị chi tiết hơn trong Wishlist
};

export type WishlistState = {
  items: WishlistItem[];
  isHydrated: boolean;
  hydrate: () => void;
  addItem: (product: WishlistItem) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  toggleItem: (product: WishlistItem) => void; // Thêm hàm toggle
};