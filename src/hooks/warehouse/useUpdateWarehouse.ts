import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateWarehouse = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await api.put(`/warehouses/${id}`, data)
      return res.data.data
    },
  })
}