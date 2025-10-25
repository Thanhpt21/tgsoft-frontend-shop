// useBrandOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useBrandOne = (id: number | string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const res = await api.get(`/brands/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}