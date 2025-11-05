import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useAllPromotions = (search?: string) => {
  return useQuery({
    queryKey: ['allPromotions', search],
    queryFn: async () => {
      const res = await api.get('/promotions/all/list', { params: { search } });
      return res.data.data;
    },
  });
};
 