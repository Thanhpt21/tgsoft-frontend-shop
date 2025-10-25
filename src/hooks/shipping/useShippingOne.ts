// src/hooks/shipping/useShippingOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ShippingOneResponse {
  success: boolean;
  message: string;
  data: any; // Thay 'any' bằng interface/type Shipping nếu bạn có
}

export const useShippingOne = (id?: number | string) => {
  return useQuery<ShippingOneResponse, Error>({
    enabled: !!id,
    queryKey: ['shipping', id],
    queryFn: async () => {
      const res = await api.get(`/shippings/${id}`);
      return res.data as ShippingOneResponse;
    },
  });
};