// hooks/payment-method/useDeletePaymentMethod.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePaymentMethod = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/payment-methods/${id}`)
      return res.data
    },
  })
}
