import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UpdateCartItemDto, CartItem } from '@/types/cart.type'

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCartItemDto }) => {
      const res = await api.put(`/cart/items/${id}`, data)
      return res.data.data as CartItem
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
