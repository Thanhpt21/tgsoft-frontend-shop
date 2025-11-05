// src/hooks/coupon/useUseCoupon.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

// Define the DTO for the request body
interface UseCouponDto {
  code: string;
  orderValue: number;
}

interface UseCouponResponse {
  success: boolean;
  message: string;
  discountAmount?: number;
  couponId?: number;
}

export const useUseCoupon = () => {
 const queryClient = useQueryClient();
  return useMutation<UseCouponResponse, Error, UseCouponDto>({

    mutationFn: async (dto: UseCouponDto) => {
      const res = await api.post('/coupons/use-coupon', dto);
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries if needed, e.g., to refetch order summary
      queryClient.invalidateQueries({ queryKey: ['orderSummary'] });
    },
    onError: (error) => {
      console.error('Failed to use coupon:', error.message);
    },
  });
};