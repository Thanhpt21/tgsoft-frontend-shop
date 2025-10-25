import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useSizeOne = (id: number | string) => {
  return useQuery({
    queryKey: ['size', id],
    queryFn: async () => {
      const res = await api.get(`/sizes/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
