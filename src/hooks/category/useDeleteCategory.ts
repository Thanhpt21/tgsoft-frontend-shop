import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/categories/${id}`)
      return res.data
    },
  })
}
