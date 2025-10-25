import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePermissionsParams {
  page?: number
  limit?: number
  search?: string
}

export const usePermissions = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePermissionsParams = {}) => {
  return useQuery({
    queryKey: ['permissions', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/permissions', {
        params: { page, limit, search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}