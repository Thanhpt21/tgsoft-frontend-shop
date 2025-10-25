// src/hooks/coupon/useCouponOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCouponOne = (id: number | string) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const res = await api.get(`/coupons/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};