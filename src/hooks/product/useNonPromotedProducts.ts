import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseNonPromotedProductsParams {
  page?: number
  limit?: number
  search?: string
  brandId?: number
  categoryId?: number
}

export const useNonPromotedProducts = ({
  page = 1,
  limit = 10,
  search = '',
  brandId,
  categoryId,
}: UseNonPromotedProductsParams = {}) => {
  return useQuery({
    queryKey: ['non-promoted-products', page, limit, search, brandId, categoryId],
    queryFn: async () => {
      const res = await api.get('/products/non-promoted', {
        params: { page, limit, search, brandId, categoryId },
      })
      return res.data.data
    },
  })
}