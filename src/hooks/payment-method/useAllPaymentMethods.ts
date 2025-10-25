// hooks/payment-method/useAllPaymentMethods.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllPaymentMethods = (search?: string) => {
  return useQuery({
    queryKey: ['allPaymentMethods', search],
    queryFn: async () => {
      const res = await api.get('/payment-methods/all', { params: { search } })
      return res.data.data
    },
  })
}
