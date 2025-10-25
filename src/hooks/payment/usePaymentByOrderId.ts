import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePaymentByOrderId = (orderId: number) => {
  return useQuery({
    queryKey: ['paymentByOrderId', orderId],
    queryFn: async () => {
      const res = await api.get(`/payments/order/${orderId}`)
      return res.data.data
    },
    enabled: !!orderId, // Only trigger if orderId is available
  })
}
