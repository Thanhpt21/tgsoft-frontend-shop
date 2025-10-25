// hooks/useShippingAddresses.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, ShippingAddress } from '@/types/shipping-address.type';

export const useShippingAddresses = (userId?: number) => {
  return useQuery({
    queryKey: ['shippingAddresses', userId],
    queryFn: async () => {
      if (!userId) {
        return undefined;
      }
      const response = await api.get<ApiResponse>(
        `/shipping-address/by-user?userId=${userId}`
      );
      return response.data.data;
    },
    enabled: !!userId, // Chỉ fetch khi userId có giá trị (không null, undefined, 0, hoặc '')
  });
}