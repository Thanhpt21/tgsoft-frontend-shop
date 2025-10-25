import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await api.put(`/categories/${id}`, data)
      return res.data.data
    },
  })
}
