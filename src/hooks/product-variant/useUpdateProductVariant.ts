// hooks/product-variant/useUpdateProductVariant.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateProductVariant = () => {
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const res = await api.put(`/product-variants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
  })
}