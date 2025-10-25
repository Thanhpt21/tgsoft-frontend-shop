import { useQuery } from '@tanstack/react-query'
import { api  } from '@/lib/axios'

export const useTenantOne = (id: number | string) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const res = await api .get(`/tenants/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}