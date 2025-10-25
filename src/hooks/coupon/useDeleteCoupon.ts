// src/hooks/coupon/useDeleteCoupon.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteCoupon = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/coupons/${id}`);
      return res.data;
    },
  });
};