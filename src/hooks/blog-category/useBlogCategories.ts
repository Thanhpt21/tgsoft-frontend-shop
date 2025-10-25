import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseBlogCategoriesParams {
  page?: number
  limit?: number
  search?: string
}

export const useBlogCategories = ({
  page = 1,
  limit = 10,
  search = '',
}: UseBlogCategoriesParams) => {
  return useQuery({
    queryKey: ['blog-categories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/blog-categories', {
        params: { page, limit, search },
      })
      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      }
    },
  })
}
