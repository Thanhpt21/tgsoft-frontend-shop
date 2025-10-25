import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface AssignAttributePayload {
  productId: number
  attributeId: number
}

export const useAssignProductAttribute = () => {
  return useMutation({
    mutationFn: async ({ productId, attributeId }: AssignAttributePayload) => {
      const res = await api.post(`/product-attributes/${productId}/${attributeId}`)
      return res.data
    },
  })
}
