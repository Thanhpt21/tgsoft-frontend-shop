// useDeleteInventory.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteInventory = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/inventories/${id}`)
      return res.data
    },
  })
}
