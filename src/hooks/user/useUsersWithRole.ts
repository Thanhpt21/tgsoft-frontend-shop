// hooks/user/useUsersWithRole.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseUsersWithRoleParams {
  page?: number
  limit?: number
  search?: string
  roleName?: string
  enabled?: boolean
}

interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  isActive: boolean
  type_account: string
  tokenAI: number
  role: string
  tenantId: number | null
  createdAt: string
  updatedAt: string
  conversationId: number | null
  stats: {
    totalMessages: number
    totalOrders: number
    totalOrderValue: number
    recentOrdersCount: number
    avgOrderValue: number
  }
  recentOrders: Array<{
    id: number
    totalAmount: number
    status: string
    createdAt: string
  }>
  roles: Array<{
    id: number
    name: string
    description: string
  }>
  hasRole: boolean
}

interface UsersWithRoleResponse {
  data: User[]
  total: number
  page: number
  pageCount: number
  filter: string
}

export const useUsersWithRole = ({
  page = 1,
  limit = 10,
  search = '',
  roleName = '',
  enabled = true,
}: UseUsersWithRoleParams = {}) => {
  return useQuery({
    queryKey: ['users-with-role', { page, limit, search, roleName }],
    queryFn: async (): Promise<UsersWithRoleResponse> => {
      const res = await api.get('/users/with-role', {
        params: { 
          page, 
          limit, 
          search,
          roleName,
          timestamp: Date.now()
        },
      })
      return res.data.data
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}