import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePromotedProductsParams {
  page?: number
  limit?: number
  search?: string
  brandId?: number
  categoryId?: number
}

export const usePromotedProducts = ({
  page = 1,
  limit = 10,
  search = '',
  brandId,
  categoryId,
}: UsePromotedProductsParams = {}) => {
  return useQuery({
    queryKey: ['promoted-products', page, limit, search, brandId, categoryId],
    queryFn: async () => {
      const res = await api.get('/products/promoted', {
        params: { page, limit, search, brandId, categoryId },
      })
      return res.data.data
    },
  })
}