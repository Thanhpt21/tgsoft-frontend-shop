import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateWarehouse = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/warehouses', data)
      return res.data.data
    },
  })
}