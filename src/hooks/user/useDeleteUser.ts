// useDeleteUser.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/users/${id}`)
      return res.data // Trả về toàn bộ { success, message, data }
    },
  })
}