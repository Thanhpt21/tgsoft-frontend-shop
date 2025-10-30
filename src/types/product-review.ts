export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  orderId?: number | null;
  orderItemId?: number | null;
  isPurchased: boolean;
  comment?: string | null;
  tenantId: number;
  createdAt: string; 
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Type cho dữ liệu tạo ProductReview
export type CreateProductReviewDto = {
  productId: number;
  userId: number;
  rating: number;
  orderId?: number;
  orderItemId?: number;
  isPurchased?: boolean;
  comment?: string;
};

// Type cho dữ liệu cập nhật ProductReview
export type UpdateProductReviewDto = {
  productId?: number;
  userId?: number;
  rating?: number;
  orderId?: number;
  orderItemId?: number;
  isPurchased?: boolean;
  comment?: string;
};

// Type cho dữ liệu trả về của một ProductReview
export type ProductReviewResponseDto = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  orderId?: number | null;
  orderItemId?: number | null;
  isPurchased: boolean;
  comment?: string | null;
  createdAt: string; 
  updatedAt: string; 
  tenantId: number; 
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

// Type cho dữ liệu trả về khi lấy danh sách ProductReviews
export type ProductReviewsResponse = {
  data: ProductReviewResponseDto[];
  total: number;
  page: number;
  pageCount: number;
};