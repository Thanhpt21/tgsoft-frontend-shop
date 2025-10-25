import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreatePermission = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/permissions', data)
      return res.data.data
    },
  })
}