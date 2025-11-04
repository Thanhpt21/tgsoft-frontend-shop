import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeletePromotionProduct = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/promotion-products/${id}`);
      return res.data;
    },
  });
};
