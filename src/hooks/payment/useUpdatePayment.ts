import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdatePayment = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/payments/${id}`, data)
      return res.data.data
    },
  })
}
