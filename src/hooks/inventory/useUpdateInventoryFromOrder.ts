// useUpdateInventoryFromOrder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateInventoryFromOrder = () => {
  return useMutation({
    mutationFn: async (orderId: number | string) => {
      const res = await api.post(`/inventories/update-from-order/${orderId}`)
      return res.data.data
    },
  })
}
