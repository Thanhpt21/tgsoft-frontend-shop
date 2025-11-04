import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreatePromotion = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/promotions', data);
      return res.data.data;
    },
  });
};
