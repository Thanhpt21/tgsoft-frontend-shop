import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllBlogs = (search?: string) => {
  return useQuery({
    queryKey: ['allBlogs', search],
    queryFn: async () => {
      const res = await api.get('/blogs/all/list', { params: { search } })
      return res.data.data
    },
  })
}
