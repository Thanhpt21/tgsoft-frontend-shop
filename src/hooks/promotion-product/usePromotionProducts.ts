import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UsePromotionProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const usePromotionProducts = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePromotionProductsParams = {}) => {
  return useQuery({
    queryKey: ['promotionProducts', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/promotion-products', {
        params: { page, limit, search },
      });
      return res.data.data;
    },
  });
};
