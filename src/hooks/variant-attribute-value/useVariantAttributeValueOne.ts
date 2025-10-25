import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useVariantAttributeValueOne = (
  variantId: number | string,
  attributeValueId: number | string
) => {
  return useQuery({
    queryKey: ['variant-attribute-value', variantId, attributeValueId],
    queryFn: async () => {
      const res = await api.get(
        `/variant-attribute-values/${variantId}/${attributeValueId}`
      )
      return res.data.data
    },
    enabled: !!variantId && !!attributeValueId,
  })
}
