import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseProductsParams {
  page?: number
  limit?: number
  search?: string
  brandId?: number
  categoryId?: number
  sortBy?: string
}

export const useProducts = ({
  page = 1,
  limit = 10,
  search = '',
  brandId,
  categoryId,
  sortBy = 'createdAt_desc',
}: UseProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', page, limit, search, brandId, categoryId, sortBy],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, limit, search, brandId, categoryId, sortBy },
      })
      return res.data.data
    },
  })
}
