// src/hooks/store/useStores.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseStoresParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useStores = ({
  page = 1,
  limit = 10,
  search = '',
}: UseStoresParams) => {
  return useQuery({
    queryKey: ['stores', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/stores', {
        params: { page, limit, search },
      });
      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};