import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllProducts = (search?: string) => {
  return useQuery({
    queryKey: ['allProducts', search],
    queryFn: async () => {
      const res = await api.get('/products/all/list', { params: { search } })
      return res.data.data
    },
  })
}