// useRoles.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseRolesParams {
  page?: number
  limit?: number
  search?: string
}

export const useRoles = ({
  page = 1,
  limit = 10,
  search = '',
}: UseRolesParams = {}) => {
  return useQuery({
    queryKey: ['roles', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/roles', {
        params: { page, limit, search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}