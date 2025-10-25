import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePermissionOne = (id: number | string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: async () => {
      const res = await api.get(`/permissions/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}