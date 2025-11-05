// src/hooks/cart/useAddCartItemWithOptimistic.ts
import { useAddCartItem } from './useAddCartItem';
import { useCartStore } from '@/stores/cartStore';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types/cart.type'; // Import CartItem

interface AddCartItemInput {
  productVariantId: number;
  quantity: number;
}

export const useAddCartItemWithOptimistic = () => {
  const mutation = useAddCartItem();
  const { addItemOptimistic, replaceTempId, removeItemOptimistic } = useCartStore();
  const queryClient = useQueryClient();

  return (
    input: AddCartItemInput,
    options?: {
      onOptimisticSuccess?: () => void;
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const tempId = -Date.now(); // Tạo ID tạm thời cho sản phẩm thêm vào

    // Tạo đối tượng CartItem tạm thời với các thuộc tính cần thiết
    const optimisticItem: CartItem = {
  id: tempId, // ID tạm thời
  cartId: 0,  // cartId có thể là null hoặc theo mặc định nếu cần
  productVariantId: input.productVariantId,
  quantity: input.quantity,
  priceAtAdd: 0,  // Nếu không cần lưu priceAtAdd tạm thời thì có thể bỏ qua
  finalPrice: 0, // Giá trị cuối cùng tạm thời
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  variant: {
    id: input.productVariantId,
    productId: 0, // ID sản phẩm tạm thời
    sku: '',  // SKU sản phẩm tạm thời
    priceDelta: 0,  // Sự thay đổi giá tạm thời
    price: 0, // Giá sản phẩm tạm thời
    attrValues: {}, // Các giá trị thuộc tính tạm thời
    thumb: '', // Ảnh sản phẩm tạm thời
    warehouseId: '', // ID kho tạm thời
    product: {
      id: 0, // ID sản phẩm tạm thời
      tenantId: 0, // Tenant ID tạm thời
      name: '', // Tên sản phẩm tạm thời
      slug: '', // Slug sản phẩm tạm thời
      description: '', // Mô tả sản phẩm tạm thời
      basePrice: 0, // Giá gốc sản phẩm tạm thời
      thumb: '', // Ảnh sản phẩm tạm thời
      images: [], // Hình ảnh sản phẩm tạm thời
      status: 'ACTIVE', // Trạng thái sản phẩm tạm thời
      isPublished: false, // Trạng thái xuất bản
      isFeatured: false, // Trạng thái nổi bật
      totalRatings: 0, // Tổng số đánh giá
      totalReviews: 0, // Tổng số nhận xét
      numberSold: 0, // Số lượng đã bán
      seoTitle: '', // SEO title
      seoDescription: '', // SEO description
      seoKeywords: '', // SEO keywords
      categoryId: 0, // ID danh mục
      brandId: 0, // ID thương hiệu
      createdById: 0, // ID người tạo
      weight: 0, // Cân nặng sản phẩm
      length: 0, // Chiều dài
      width: 0, // Chiều rộng
      height: 0, // Chiều cao
      createdAt: '', // Ngày tạo
      updatedAt: '', // Ngày cập nhật
      promotionProducts: [], // Danh sách khuyến mãi
    },
  },
};

    // Thêm sản phẩm tạm thời vào giỏ hàng
    addItemOptimistic(optimisticItem);

    options?.onOptimisticSuccess?.();  // Gọi callback nếu cần

    // Gọi API để thêm sản phẩm thực sự vào giỏ hàng
    mutation.mutate(input, {
      onSuccess: (newItem: any) => {
        replaceTempId(tempId, newItem.id);  // Thay thế tempId bằng ID thực sự từ API
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        options?.onSuccess?.();
      },
      onError: (err) => {
        removeItemOptimistic(tempId);  // Xóa sản phẩm tạm thời nếu gặp lỗi
        message.error('Thêm thất bại, đã gỡ khỏi giỏ');
        options?.onError?.();
      },
    });
  };
};
