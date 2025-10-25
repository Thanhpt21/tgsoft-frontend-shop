// useUsersOfTenant.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUsersOfTenant = (tenantId: number) => {
  return useQuery({
    queryKey: ['tenant-users', tenantId], // Khóa query cho tenant users
    queryFn: async () => {
      const res = await api.get(`/user-tenant-roles/tenant/${tenantId}/users`) // Gọi API để lấy danh sách người dùng
      return res.data.data // Trả về danh sách người dùng
    },
    enabled: !!tenantId, // Chỉ thực hiện khi có tenantId
  })
}
