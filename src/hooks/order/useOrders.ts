import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Order } from '@/types/order.type'


interface UseOrdersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  userId?: number
}

export const useOrders = ({
  page = 1,
  limit = 10,
  search = '',
  status,
  userId,
}: UseOrdersParams = {}) => {
  return useQuery({
    queryKey: ['orders', page, limit, search, status, userId],
    queryFn: async (): Promise<{ data: Order[]; total: number; page: number; pageCount: number }> => {
      const res = await api.get('/orders', {
        params: { page, limit, search, status, userId },
      })
      return res.data.data
    },
  })
}