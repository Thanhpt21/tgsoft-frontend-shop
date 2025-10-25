// useUpdateRole.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: any
    }) => {
      const res = await api.put(`/roles/${id}`, data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}