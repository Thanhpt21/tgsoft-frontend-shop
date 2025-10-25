import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface RemoveAttributePayload {
  productId: number
  attributeId: number
}

export const useRemoveProductAttribute = () => {
  return useMutation({
    mutationFn: async ({ productId, attributeId }: RemoveAttributePayload) => {
      const res = await api.delete(`/product-attributes/${productId}/${attributeId}`)
      return res.data
    },
  })
}
