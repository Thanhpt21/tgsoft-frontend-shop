import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useShippingAddressesByUserId = (userId: number | string) => {
  return useQuery({
    queryKey: ['shipping-addresses', 'user', userId],
    queryFn: async () => {
      const res = await api.get(`/shipping-addresses/user/${userId}`);
      return res.data.data;
    },
    enabled: !!userId, // Kích hoạt query khi có userId
  });
};
