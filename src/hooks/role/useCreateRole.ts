import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateRole = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/roles', data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}