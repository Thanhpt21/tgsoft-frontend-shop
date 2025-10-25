import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePermission = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/permissions/${id}`)
      return res.data
    },
  })
}