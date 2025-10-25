import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteSize = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/sizes/${id}`)
      return res.data
    },
  })
}
