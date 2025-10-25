import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteRole = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/roles/${id}`)
      return res.data // Trả về toàn bộ { success, message, data }
    },
  })
}