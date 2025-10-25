import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCheckoutCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/cart/checkout')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
