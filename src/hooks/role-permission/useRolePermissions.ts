// useRolePermissions.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useRolePermissions = (roleId: number) => {
  return useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: async () => {
      const res = await api.get(`/role-permissions/${roleId}`)
      return res.data.data
    },
    enabled: !!roleId,
  })
}