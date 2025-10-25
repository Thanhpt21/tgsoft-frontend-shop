import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteProductVariant = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/product-variants/${id}`)
      return res.data
    },
  })
}
