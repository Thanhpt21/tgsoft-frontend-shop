// useAllBrands.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllBrands = (search?: string) => {
  return useQuery({
    queryKey: ['allBrands', search],
    queryFn: async () => {
      const res = await api.get('/brands/all/list', { params: { search } })
      return res.data.data
    },
  })
}
