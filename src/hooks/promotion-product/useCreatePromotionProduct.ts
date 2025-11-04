import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreatePromotionProduct = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/promotion-products', data);
      return res.data.data;
    },
  });
};
