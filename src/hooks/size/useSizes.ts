import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseSizesParams {
  page?: number
  limit?: number
  search?: string
}

export const useSizes = ({
  page = 1,
  limit = 10,
  search = '',
}: UseSizesParams) => {
  return useQuery({
    queryKey: ['sizes', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/sizes', {
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
