import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllAttributes = (search?: string) => {
  return useQuery({
    queryKey: ['allAttributes', search],
    queryFn: async () => {
      const res = await api.get('/attributes/all/list', {
        params: { search },
      })
      return res.data.data // Lấy mảng attribute
    },
  })
}
