import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface RemoveRoleFromTenantParams {
  userId: number
  tenantId: number
  roleId: number
}

export const useRemoveRoleFromTenant = () => {
  return useMutation({
    mutationFn: async ({ userId, tenantId, roleId }: RemoveRoleFromTenantParams) => {
      const res = await api.delete(`/user-tenant-roles/${userId}/${tenantId}/${roleId}`)
      return res.data
    },
  })
}