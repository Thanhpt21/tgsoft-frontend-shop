// hooks/config/useCreateConfig.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateConfig = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/configs', data)
      return res.data.data
    },
  })
}