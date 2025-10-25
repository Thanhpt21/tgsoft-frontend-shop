// useAddRolePermission.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface AddRolePermissionDto {
  roleId: number
  permissionId: number
}

export const useAddRolePermission = () => {
  return useMutation({
    mutationFn: async (data: AddRolePermissionDto) => {
      const res = await api.post('/role-permissions', data)
      return res.data.data
    },
  })
}