// useUsers.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseUsersParams {
  page?: number
  limit?: number
  search?: string
}

export const useUsers = ({
  page = 1,
  limit = 10,
  search = '',
}: UseUsersParams = {}) => {
  return useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: { page, limit, search },
      })
      return res.data.data // Trả về { items, total, page, pageCount }
    },
  })
}