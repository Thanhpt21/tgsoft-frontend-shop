import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateAttribute = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/attributes', data)
      return res.data.data
    },
  })
}
