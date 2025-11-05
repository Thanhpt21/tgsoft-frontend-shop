// hooks/config/useConfigByTenant.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID // string | undefined

export const useConfigByTenant = () => {
  return useQuery({
    queryKey: ['config', 'tenant', TENANT_ID],
    queryFn: async () => {
      if (!TENANT_ID) throw new Error('Tenant ID chưa được cấu hình')
      const res = await api.get(`/configs/tenant/${TENANT_ID}`)
      return res.data.data
    },
    enabled: !!TENANT_ID, // chỉ chạy query nếu TENANT_ID tồn tại
  })
}
