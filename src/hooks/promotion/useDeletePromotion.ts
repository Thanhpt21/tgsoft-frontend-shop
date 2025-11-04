import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeletePromotion = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/promotions/${id}`);
      return res.data;
    },
  });
};
