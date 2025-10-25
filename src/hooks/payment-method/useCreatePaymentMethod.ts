// hooks/payment-method/useCreatePaymentMethod.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreatePaymentMethod = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/payment-methods', data)
      return res.data.data
    },
  })
}
