// useAllPermissions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllPermissions = (search?: string) => {
  return useQuery({
    queryKey: ['allPermissions', search],
    queryFn: async () => {
      const res = await api.get('/permissions/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}