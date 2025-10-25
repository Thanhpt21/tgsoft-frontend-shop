// hooks/payment-method/usePaymentMethodOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePaymentMethodOne = (id: number | string) => {
  return useQuery({
    queryKey: ['paymentMethod', id],
    queryFn: async () => {
      const res = await api.get(`/payment-methods/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
