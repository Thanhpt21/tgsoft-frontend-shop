// hooks/useTenantAdminShopTokens.ts
import { useQuery } from '@tanstack/react-query'

export const useTenantAdminShopTokens = (tenantId?: number) => {
  return useQuery({
    queryKey: ['tenantAdminShopTokens', tenantId],
    queryFn: async () => {
      const validTenantId = tenantId && !isNaN(tenantId) ? tenantId : 1;
      
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/tenant/admin-shop/tokens`,
        {
          headers: {
            'x-tenant-id': validTenantId.toString(),
          },
        }
      )
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ API Error ${res.status}:`, errorText);
        throw new Error(`Failed to fetch tokens: ${res.status}`);
      }
      
      const data = await res.json();
      return data.data;
    },
    enabled: !!tenantId && !isNaN(tenantId),
    retry: 2, // Retry 2 lần nếu fail
  })
}