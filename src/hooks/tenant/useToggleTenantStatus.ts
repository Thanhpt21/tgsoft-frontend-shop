import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useToggleTenantStatus = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.patch(`/tenants/${id}/toggle-status`)
      return res.data.data // Lấy data từ { success, message, data }
    },
  })
}