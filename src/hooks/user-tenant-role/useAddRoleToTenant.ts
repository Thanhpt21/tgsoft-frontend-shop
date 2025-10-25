import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface AddRoleToTenantDto {
  userId: number
  tenantId: number
  roleId: number
}

export const useAddRoleToTenant = () => {
  return useMutation({
    mutationFn: async (data: AddRoleToTenantDto) => {
      const res = await api.post('/user-tenant-roles', data)
      return res.data.data
    },
  })
}