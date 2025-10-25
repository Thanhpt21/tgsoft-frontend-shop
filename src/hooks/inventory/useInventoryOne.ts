// useInventoryOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useInventoryOne = (id: number | string) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const res = await api.get(`/inventories/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}