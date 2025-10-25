// src/hooks/coupon/useUpdateCoupon.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useUpdateCoupon = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount' | 'Order'>;
    }) => {
      const res = await api.put(`/coupons/${id}`, data);
      return res.data;
    },
  });
};