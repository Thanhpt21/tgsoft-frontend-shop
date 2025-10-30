import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateShippingAddress = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await api.put(`/shipping-addresses/${id}`, data);
      return res.data.data;
    },
  });
};
