import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useShippingAddressOne = (id: number | string) => {
  return useQuery({
    queryKey: ['shipping-address', id],
    queryFn: async () => {
      const res = await api.get(`/shipping-addresses/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};
