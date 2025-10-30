import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseShippingAddressesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useShippingAddresses = ({
  page = 1,
  limit = 10,
  search = '',
}: UseShippingAddressesParams = {}) => {
  return useQuery({
    queryKey: ['shipping-addresses', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/shipping-addresses', { params: { page, limit, search } });
      return res.data.data;
    },
  });
};
