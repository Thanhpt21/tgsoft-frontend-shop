// hooks/payment-method/usePaymentMethods.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePaymentMethodsParams {
  page?: number
  limit?: number
  search?: string
}

export const usePaymentMethods = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePaymentMethodsParams = {}) => {
  return useQuery({
    queryKey: ['paymentMethods', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/payment-methods', {
        params: { page, limit, search },
      })
      return res.data.data
    },
  })
}
