// useProductOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useProductOne = (id: number | string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}