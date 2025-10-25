// useAllRoles.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllRoles = (search?: string) => {
  return useQuery({
    queryKey: ['allRoles', search],
    queryFn: async () => {
      const res = await api.get('/roles/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}