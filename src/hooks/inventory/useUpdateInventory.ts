// useUpdateInventory.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateInventory = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await api.put(`/inventories/${id}`, data)
      return res.data.data
    },
  })
}