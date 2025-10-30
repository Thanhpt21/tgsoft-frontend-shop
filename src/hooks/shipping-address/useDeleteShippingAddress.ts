import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteShippingAddress = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/shipping-addresses/${id}`);
      return res.data;
    },
  });
};
