// useRoleOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRoleOne = (id: number | string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      const res = await api.get(`/roles/${id}`)
      return res.data.data // Lấy data từ { success, message, data }
    },
    enabled: !!id,
  })
}