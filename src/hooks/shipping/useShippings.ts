// src/hooks/shipping/useShippings.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingResponse } from '@/types/shipping.type';

interface UseShippingsParams {
  page?: number;
  limit?: number;
  search?: string;
}


export const useShippings = ({ page = 1, limit = 10, search = '' }: UseShippingsParams) => {
  return useQuery<ShippingResponse, Error>({
    queryKey: ['shippings', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/shippings', {
        params: { page, limit, search },
      });
      return res.data as ShippingResponse;
    },
  });
};