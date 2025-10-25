// src/hooks/shipping/useAllShippings.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Shipping } from '@/types/shipping.type';

interface UseAllShippingsParams {
  search?: string;
}

interface AllShippingResponse {
  success: boolean;
  message: string;
  data: Shipping[];
}

export const useAllShippings = ({ search = '' }: UseAllShippingsParams = {}) => {
  return useQuery<AllShippingResponse, Error>({
    queryKey: ['allShippings', search],
    queryFn: async () => {
      const res = await api.get('/shippings/all', {
        params: { search },
      });
      return res.data as AllShippingResponse;
    },
  });
};