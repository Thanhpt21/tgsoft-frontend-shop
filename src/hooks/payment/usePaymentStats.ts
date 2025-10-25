import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['paymentStats'],
    queryFn: async () => {
      const res = await api.get('/payments/stats')
      return res.data.data
    },
  })
}
