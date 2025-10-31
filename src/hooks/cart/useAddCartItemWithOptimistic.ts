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
      variant: {
        id: input.productVariantId,
        sku: '',  // Cập nhật nếu cần
        priceDelta: 0,  // Cập nhật nếu cần
        attrValues: {}, // Không có attribute tạm thời
        thumb: '', // Không có thumb tạm thời
        warehouseId: '', // Cập nhật nếu cần
        product: {
          id: 0, // Thêm id của sản phẩm nếu cần
          name: '', // Thêm tên sản phẩm nếu cần
          basePrice: 0, // Dùng giá sản phẩm nếu cần
          thumb: '', // Ảnh sản phẩm nếu cần
          weight: 0, // Cập nhật nếu cần
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
