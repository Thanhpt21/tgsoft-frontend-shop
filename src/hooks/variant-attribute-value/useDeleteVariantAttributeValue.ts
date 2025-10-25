import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteVariantAttributeValue = () => {
  return useMutation({
    mutationFn: async ({
      variantId,
      attributeValueId,
    }: {
      variantId: number | string
      attributeValueId: number | string
    }) => {
      const res = await api.delete(
        `/variant-attribute-values/${variantId}/${attributeValueId}`
      )
      return res.data
    },
  })
}
