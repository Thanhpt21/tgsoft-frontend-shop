import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePaymentsParams {
  page?: number
  limit?: number
  orderId?: number
  status?: string
  methodId?: number
  search?: string
}

export const usePayments = ({
  page = 1,
  limit = 10,
  orderId,
  status,
  methodId,
  search = '',
}: UsePaymentsParams = {}) => {
  return useQuery({
    queryKey: ['payments', page, limit, orderId, status, methodId, search],
    queryFn: async () => {
      const res = await api.get('/payments', {
        params: { page, limit, orderId, status, methodId, search },
      })
      return res.data.data
    },
  })
}
