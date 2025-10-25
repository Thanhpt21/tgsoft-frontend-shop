import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProductAttributes = (productId: number) => {
  return useQuery({
    queryKey: ['product-attributes', productId],
    queryFn: async () => {
      const res = await api.get(`/product-attributes/${productId}`)
      return res.data.data
    },
    enabled: !!productId,
  })
}
