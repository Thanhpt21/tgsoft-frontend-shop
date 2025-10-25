import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/categories', data)
      return res.data.data
    },
  })
}
