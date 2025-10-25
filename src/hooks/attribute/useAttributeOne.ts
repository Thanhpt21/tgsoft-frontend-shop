import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAttributeOne = (id: number | string) => {
  return useQuery({
    queryKey: ['attribute', id],
    queryFn: async () => {
      const res = await api.get(`/attributes/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
