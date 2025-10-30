import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductReviewResponseDto } from '@/types/product-review';

export const useProductReviewOne = (id: number | string) => {
  return useQuery({
    queryKey: ['product-review', id],
    queryFn: async (): Promise<ProductReviewResponseDto> => {
      const res = await api.get(`/product-reviews/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};