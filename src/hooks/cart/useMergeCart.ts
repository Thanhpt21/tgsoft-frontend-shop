import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { MergeCartDto } from '@/types/cart.type'

export const useMergeCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MergeCartDto) => {
      const res = await api.post('/cart/merge', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
