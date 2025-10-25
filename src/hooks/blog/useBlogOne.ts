import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useBlogOne = (id: number | string) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await api.get(`/blogs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
