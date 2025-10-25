// useUpdateOrder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Order } from '@/types/order.type';


export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }): Promise<Order> => {
      const res = await api.put(`/orders/${id}`, data)
      return res.data.data
    },
  })
}