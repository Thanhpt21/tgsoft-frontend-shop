import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateSize = () => {
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const res = await api.post('/sizes', data)
      return res.data
    },
  })
}
