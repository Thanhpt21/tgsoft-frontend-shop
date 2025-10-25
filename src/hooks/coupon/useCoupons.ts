// src/hooks/coupon/useCoupons.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCoupons = ({
  page = 1,
  limit = 10,
  search = '',
}: UseCouponsParams) => {
  return useQuery({
    queryKey: ['coupons', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/coupons', {
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