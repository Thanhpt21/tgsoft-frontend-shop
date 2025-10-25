import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVariantAttributeValues = (variantId?: number | string) => {
  return useQuery({
    queryKey: ['variant-attribute-values', variantId],
    queryFn: async () => {
      const res = await api.get('/variant-attribute-values', {
        params: variantId ? { variantId } : {},
      })
      return res.data.data
    },
    enabled: !!variantId, // 👈 chỉ chạy khi có variantId, nhưng hook vẫn luôn được gọi
  })
}
