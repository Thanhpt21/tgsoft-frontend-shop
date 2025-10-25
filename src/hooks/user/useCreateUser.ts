// useCreateUser.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/users', data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}