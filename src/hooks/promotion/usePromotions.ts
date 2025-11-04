import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UsePromotionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const usePromotions = ({
  page = 1,
  limit = 10,
  search = '',
}: UsePromotionsParams = {}) => {
  return useQuery({
    queryKey: ['promotions', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/promotions', {
        params: { page, limit, search },
      });
      return res.data.data;
    },
  });
};
