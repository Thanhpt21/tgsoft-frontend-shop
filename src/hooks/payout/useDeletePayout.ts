// useDeletePayout.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeletePayout = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/payouts/${id}`)
      return res.data
    },
  })
}
