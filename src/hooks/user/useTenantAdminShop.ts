// hooks/useTenantAdminShop.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useTenantAdminShop = (tenantId?: number) => {
  return useQuery({
    queryKey: ['tenantAdminShop', tenantId],
    queryFn: async () => {
      const res = await api.get(`/users/tenant/admin-shop`, {
        headers: {
          'x-tenant-id': tenantId?.toString() || '1',
        },
      })
      return res.data.data // Lấy data từ { success, message, data }
    },
    enabled: !!tenantId,
  })
}