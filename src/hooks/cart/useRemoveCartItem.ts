// src/hooks/cart/useRemoveCartItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Cart } from '@/types/cart.type';

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cart/items/${id}`);
      return id; // trả về ID đã xóa
    },
    onMutate: async (id) => {
      // 1. Cancel refetch
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // 2. Lấy data cũ
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      // 3. Cập nhật optimistic
      if (previousCart) {
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== id),
        });
      }

      return { previousCart }; // để rollback nếu lỗi
    },
    onError: (err, id, context: any) => {
      // Rollback
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      // Đảm bảo đồng bộ cuối cùng
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};