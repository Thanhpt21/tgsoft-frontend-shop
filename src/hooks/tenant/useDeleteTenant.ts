import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteTenant = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/tenants/${id}`)
      return res.data
    },
  })
}