import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllTenants = (search?: string) => {
  return useQuery({
    queryKey: ['allTenants', search],
    queryFn: async () => {
      const res = await api.get('/tenants/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}