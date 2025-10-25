import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useWarehouseOne = (id: number | string) => {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const res = await api.get(`/warehouses/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}