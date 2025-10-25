// useCreateOrder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Order } from '@/types/order.type'


export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: any): Promise<Order> => {
      const res = await api.post('/orders', data)
      return res.data.data
    },
  })
}