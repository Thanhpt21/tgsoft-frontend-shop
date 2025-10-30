import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductReviewsResponse } from '@/types/product-review';

interface UseProductReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: number;
}

export const useProductReviews = ({
  page = 1,
  limit = 10,
  search = '',
  productId,
}: UseProductReviewsParams = {}) => {
  return useQuery({
    queryKey: ['product-reviews', page, limit, search, productId],
    queryFn: async (): Promise<ProductReviewsResponse> => {
      const res = await api.get('/product-reviews', {
        params: {
          page,
          limit,
          search,
          productId,
        },
      });
      return res.data.data;
    },
  });
};