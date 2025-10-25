import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteWarehouse = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/warehouses/${id}`)
      return res.data
    },
  })
}