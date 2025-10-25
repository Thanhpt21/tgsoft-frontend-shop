import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateTenant = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: any
    }) => {
      const res = await api.put(`/tenants/${id}`, data)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}
