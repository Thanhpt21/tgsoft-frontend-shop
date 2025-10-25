import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePayment = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/payments/${id}`)
      return res.data
    },
  })
}
