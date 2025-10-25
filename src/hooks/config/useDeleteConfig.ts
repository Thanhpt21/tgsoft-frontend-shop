// hooks/config/useDeleteConfig.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteConfig = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/configs/${id}`)
      return res.data
    },
  })
}