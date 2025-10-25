// src/hooks/shipping/useCreateShipping.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateShippingPayload {
  provinceName: string;
  fee: number;
}

interface CreateShippingResponse {
  success: boolean;
  message: string;
  data: any; // Thay 'any' bằng interface/type Shipping nếu bạn có
}

export const useCreateShipping = () => {
  return useMutation<CreateShippingResponse, Error, CreateShippingPayload>({
    mutationFn: async (data: CreateShippingPayload) => {
      const res = await api.post('/shippings', data);
      return res.data as CreateShippingResponse;
    },
  });
};