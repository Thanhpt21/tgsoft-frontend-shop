// src/hooks/order/useOrdersByUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/types/order.type';

interface UseOrdersByUserParams {
  userId?: number;  // userId có thể là undefined
  page?: number;
  limit?: number;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageCount: number;
}

export const useOrdersByUser = ({ userId, page = 1, limit = 10 }: UseOrdersByUserParams) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', 'user', userId, page, limit],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const res = await api.get(`/orders/user/${userId}`, {
        params: { page, limit },
      });
      return res.data.data as OrdersResponse;
    },
    enabled: !!userId, // Chỉ chạy khi có userId
  });
};
