
// useDeleteProduct.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/products/${id}`)
      return res.data
    },
  })
}