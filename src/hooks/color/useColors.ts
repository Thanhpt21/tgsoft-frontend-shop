// src/hooks/color/useColors.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseColorsParams {
  page?: number
  limit?: number
  search?: string
}

export const useColors = ({
  page = 1,
  limit = 10,
  search = '',
}: UseColorsParams) => {
  return useQuery({
    queryKey: ['colors', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/colors', {
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
