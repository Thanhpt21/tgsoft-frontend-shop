// src/hooks/coupon/useCreateCoupon.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateCoupon = () => {
  return useMutation({
    mutationFn: async (data: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount' | 'Order'>) => {
      const res = await api.post('/coupons', data);
      return res.data;
    },
  });
};