import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteProductReview = () => {
  return useMutation({
    mutationFn: async (id: number | string): Promise<{ success: boolean; message: string }> => {
      const res = await api.delete(`/product-reviews/${id}`);
      return res.data;
    },
  });
};