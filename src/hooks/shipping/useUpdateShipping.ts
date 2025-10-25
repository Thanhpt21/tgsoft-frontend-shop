// src/hooks/shipping/useUpdateShipping.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateShippingPayload {
  id: number | string;
  provinceName?: string;
  fee?: number;
}

interface UpdateShippingResponse {
  success: boolean;
  message: string;
  data: any; // Thay 'any' bằng interface/type Shipping nếu bạn có
}

export const useUpdateShipping = () => {
  return useMutation<UpdateShippingResponse, Error, UpdateShippingPayload>({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/shippings/${id}`, data);
      return res.data as UpdateShippingResponse;
    },
  });
};