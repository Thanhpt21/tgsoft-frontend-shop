// hooks/tenant/useTenantAIConfig.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useTenantAIConfig = (id: number | string) => {
  return useQuery({
    queryKey: ['tenant-ai-config', id],
    queryFn: async () => {
      const res = await api.get(`/tenants/${id}/ai-config`)
      return res.data.data
    },
    enabled: !!id,
  })
}