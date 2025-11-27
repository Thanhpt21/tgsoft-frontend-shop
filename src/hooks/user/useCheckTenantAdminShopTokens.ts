// hooks/useCheckTenantAdminShopTokens.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCheckTenantAdminShopTokens = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      tokensNeeded, 
      tenantId 
    }: { 
      tokensNeeded: number
      tenantId?: number 
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/tenant/admin-shop/check-tokens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId?.toString() || '1',
          },
          body: JSON.stringify({ tokensNeeded }),
        }
      )
      
      if (!res.ok) throw new Error('Failed to check tenant admin shop tokens');
      const data = await res.json();
      return data.data; // { hasEnoughTokens, currentTokens, tokensNeeded, remaining }
    },
    onSuccess: (data, variables) => {
      // Invalidate tokens query để cập nhật số token mới nhất
      queryClient.invalidateQueries({ queryKey: ['tenantAdminShopTokens', variables.tenantId] })
    },
  })
}