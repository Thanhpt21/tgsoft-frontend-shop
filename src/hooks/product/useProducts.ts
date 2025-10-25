// useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseProductsParams {
  page?: number
  limit?: number
  search?: string
}

export const useProducts = ({
  page = 1,
  limit = 10,
  search = '',
}: UseProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, limit, search },
      })
      return res.data.data
    },
  })
}
