import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useBlogCategoryOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['blog-category', id],
    queryFn: async () => {
      const res = await api.get(`/blog-categories/${id}`)
      return res.data
    },
  })
}
