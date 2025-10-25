import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateTenant = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/tenants', data)
      return res.data.data
    },
  })
}