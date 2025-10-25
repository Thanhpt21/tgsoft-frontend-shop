import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseTenantsParams {
  page?: number
  limit?: number
  search?: string
}

export const useTenants = ({
  page = 1,
  limit = 10,
  search = '',
}: UseTenantsParams = {}) => {
  return useQuery({
    queryKey: ['tenants', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/tenants', {
        params: { page, limit, search },
      })
      return res.data.data // Trả về { items, total, page, pageCount }
    },
  })
}
