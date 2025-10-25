// hooks/shipping-address/useDeleteShippingAddress.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteShippingAddress = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/shipping-address/${id}`);
      return res.data;
    },
  });
};