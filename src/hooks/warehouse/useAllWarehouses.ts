import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllWarehouses = (search?: string) => {
  return useQuery({
    queryKey: ['allWarehouses', search],
    queryFn: async () => {
      const res = await api.get('/warehouses/all/list', { params: { search } })
      return res.data.data
    },
  })
}