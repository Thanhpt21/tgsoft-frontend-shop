import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/payments', data)
      return res.data.data
    },
  })
}
