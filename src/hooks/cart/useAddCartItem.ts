import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { AddCartItemDto, CartItem } from '@/types/cart.type'

export const useAddCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddCartItemDto) => {
      const res = await api.post('/cart/items', data)
      return res.data.data as CartItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })

    },
  })
}
