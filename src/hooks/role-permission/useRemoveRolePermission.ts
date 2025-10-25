// useRemoveRolePermission.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface RemoveRolePermissionDto {
  roleId: number
  permissionId: number
}

export const useRemoveRolePermission = () => {
  return useMutation({
    mutationFn: async ({ roleId, permissionId }: RemoveRolePermissionDto) => {
      const res = await api.delete(`/role-permissions/${roleId}/${permissionId}`)
      return res.data
    },
  })
}