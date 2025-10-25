import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface CreateProductVariantPayload {
  productId: number | string
  formData: FormData
}

export const useCreateProductVariant = () => {
  return useMutation({
    mutationFn: async ({ productId, formData }: CreateProductVariantPayload) => {
      const res = await api.post(`/product-variants/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
  })
}
