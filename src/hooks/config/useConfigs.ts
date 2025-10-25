// hooks/config/useConfigs.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseConfigsParams {
  page?: number
  limit?: number
  search?: string
}

export const useConfigs = ({
  page = 1,
  limit = 10,
  search = '',
}: UseConfigsParams = {}) => {
  return useQuery({
    queryKey: ['configs', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/configs', {
        params: { page, limit, search },
      })
      return res.data.data
    },
  })
}