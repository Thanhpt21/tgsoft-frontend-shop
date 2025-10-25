import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRolesOfUserInTenant = (userId: number, tenantId: number) => {
  return useQuery({
    queryKey: ['user-tenant-roles', userId, tenantId], // Khóa query riêng biệt
    queryFn: async () => {
      const res = await api.get(`/user-tenant-roles/user/${userId}/tenant/${tenantId}`)
      return res.data.data // Trả về danh sách roles
    },
    enabled: !!userId && !!tenantId, // Chỉ gọi khi có cả userId & tenantId
  })
}
