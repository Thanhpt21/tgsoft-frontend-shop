// hooks/useUpdateTenantAdminShopTokens.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useUpdateTenantAdminShopTokens = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      tokensUsed, 
      tenantId 
    }: { 
      tokensUsed: number
      tenantId?: number 
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/tenant/admin-shop/tokens`,
        {
          method: 'PUT', // Sửa thành PUT theo controller
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId?.toString() || '1',
          },
          body: JSON.stringify({ tokensUsed }),
        }
      )
      
      if (!res.ok) throw new Error('Failed to update tenant admin shop tokens');
      const data = await res.json();
      return data.data; // { id, tokenAI, name, email, role, tenantId }
    },
    onSuccess: (data, variables) => {
      // Invalidate cả 2 queries liên quan
      queryClient.invalidateQueries({ queryKey: ['tenantAdminShopTokens', variables.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['tenantAdminShop', variables.tenantId] })
    },
  })
}