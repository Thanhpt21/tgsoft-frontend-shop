import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CreateProductReviewDto } from '@/types/product-review';


export const useCreateProductReview = () => {
  return useMutation({
    mutationFn: async (data: CreateProductReviewDto) => {
      const res = await api.post('/product-reviews', data);
      return res.data.data;
    },
  });
};