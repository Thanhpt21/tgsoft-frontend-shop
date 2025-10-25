import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseBlogsParams {
  page?: number
  limit?: number
  search?: string
}

export const useBlogs = ({ page = 1, limit = 10, search = '' }: UseBlogsParams = {}) => {
  return useQuery({
    queryKey: ['blogs', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/blogs', { params: { page, limit, search } })
      return res.data.data
    },
  })
}
