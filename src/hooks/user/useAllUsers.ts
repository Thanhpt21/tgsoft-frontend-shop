// useAllUsers.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useAllUsers = (search?: string) => {
  return useQuery({
    queryKey: ['allUsers', search],
    queryFn: async () => {
      const res = await api.get('/users/all/list', {
        params: { search },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}
