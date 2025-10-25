import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/cart/items/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
