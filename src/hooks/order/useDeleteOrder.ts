// useDeleteOrder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/orders/${id}`)
      return res.data
    },
  })
}