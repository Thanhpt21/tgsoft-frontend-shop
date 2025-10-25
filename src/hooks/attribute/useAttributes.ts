import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseAttributesParams {
  page?: number
  limit?: number
  search?: string
}

export const useAttributes = ({
  page = 1,
  limit = 10,
  search = '',
}: UseAttributesParams = {}) => {
  return useQuery({
    queryKey: ['attributes', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/attributes', {
        params: { page, limit, search },
      })
      return res.data.data
    },
  })
}
