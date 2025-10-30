import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { UpdateProductReviewDto, ProductReviewResponseDto } from '@/types/product-review';

export const useUpdateProductReview = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: UpdateProductReviewDto }): Promise<ProductReviewResponseDto> => {
      const res = await api.put(`/product-reviews/${id}`, data);
      return res.data.data;
    },
  });
};