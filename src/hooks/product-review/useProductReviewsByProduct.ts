import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductReviewsResponse } from '@/types/product-review';

interface UseProductReviewsByProductParams {
  productId: number | string;
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export const useProductReviewsByProduct = ({
  productId,
  page = 1,
  limit = 10,
  search = '',
  enabled = true,
}: UseProductReviewsByProductParams) => {
  return useQuery({
    queryKey: ['product-reviews', productId, page, limit, search],
    queryFn: async (): Promise<ProductReviewsResponse> => {
      const res = await api.get(`/product-reviews/product/${productId}`, {
        params: {
          page,
          limit,
          search,
        },
      });
      return res.data.data;
    },
    enabled: !!productId && enabled,
  });
};