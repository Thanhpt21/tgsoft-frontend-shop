
import { api } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'

interface UpdateVariantAttributeValueData {
  variantId?: number
  attributeValueId?: number
}

interface UpdateVariantAttributeValueParams {
  variantId: number
  attributeValueId: number
  data: UpdateVariantAttributeValueData
}

export const useUpdateVariantAttributeValue = () => {
  return useMutation({
    mutationFn: async ({ variantId, attributeValueId, data }: UpdateVariantAttributeValueParams) => {
      const res = await api.put(
        `/variant-attribute-values/${variantId}/${attributeValueId}`,
        data
      )
      return res.data.data
    },
  })
}