// src/hooks/shipping/useDeleteShipping.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface DeleteShippingResponse {
  success: boolean;
  message: string;
}

export const useDeleteShipping = () => {
  return useMutation<DeleteShippingResponse, Error, number | string>({
    mutationFn: async (id) => {
      const res = await api.delete(`/shippings/${id}`);
      return res.data as DeleteShippingResponse;
    },
  });
};