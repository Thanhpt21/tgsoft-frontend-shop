// hooks/payment-method/useUpdatePaymentMethod.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdatePaymentMethod = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await api.put(`/payment-methods/${id}`, data)
      return res.data.data
    },
  })
}
