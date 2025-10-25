import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { ProductVariant } from '@/types/product-variant.type'

interface GetVariantsResponse {
  success: boolean
  message: string
  data: ProductVariant[]
}

export const useProductVariants = (productId?: number) => {
  return useQuery({
    queryKey: ['productVariants', productId],
    queryFn: async () => {
      if (!productId) return []
      const res = await api.get<GetVariantsResponse>(`/product-variants/${productId}`)
      return res.data.data
    },
    enabled: !!productId,
  })
}
