// src/hooks/cart/useUpdateCartItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { UpdateCartItemDto, Cart, CartItem } from '@/types/cart.type';

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCartItemDto }) => {
      const res = await api.put(`/cart/items/${id}`, data);
      return res.data.data as CartItem;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        });
      }

      return { previousCart };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};