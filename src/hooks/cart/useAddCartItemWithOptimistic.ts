// src/hooks/cart/useAddCartItemWithOptimistic.ts
import { useAddCartItem } from './useAddCartItem';
import { useCartStore } from '@/stores/cartStore';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

interface AddCartItemInput {
  productVariantId: number;
  quantity: number;
}

interface OptimisticMetadata {
  productName: string;
  thumb: string;
  attributes: Record<string, string>;
  priceAtAdd: number;
}

export const useAddCartItemWithOptimistic = () => {
  const mutation = useAddCartItem();
  const { addItemOptimistic, replaceTempId, removeItemOptimistic } = useCartStore();
  const queryClient = useQueryClient();

  return (
    input: AddCartItemInput,
    metadata: OptimisticMetadata,
    options?: {
      onOptimisticSuccess?: () => void; // GỌI NGAY SAU KHI THÊM OPTIMISTIC
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const tempId = -Date.now();

    // 1. THÊM TỨC THÌ → GỌI onOptimisticSuccess NGAY
    addItemOptimistic({
      ...input,
      id: tempId,
      priceAtAdd: metadata.priceAtAdd,
      productName: metadata.productName,
      thumb: metadata.thumb,
      attributes: metadata.attributes,
    });

    options?.onOptimisticSuccess?.(); // HIỆN THÔNG BÁO NGAY TẠI ĐÂY!

    // 2. GỌI API (không ảnh hưởng UI)
    mutation.mutate(input, {
      onSuccess: (newItem: any) => {
        replaceTempId(tempId, newItem.id);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        options?.onSuccess?.();
      },
      onError: (err) => {
        removeItemOptimistic(tempId);
        message.error('Thêm thất bại, đã gỡ khỏi giỏ');
        options?.onError?.();
      },
    });
  };
};