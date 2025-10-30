import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateShippingAddress = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/shipping-addresses', data);
      return res.data.data;
    },
  });
};
