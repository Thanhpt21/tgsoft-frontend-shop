// hooks/useOrderCount.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface OrderCountStatistics {
  totalOrders: number;
  startDate: string;
  endDate: string;
  status: string;
  breakdownByStatus: Array<{
    status: string;
    count: number;
  }>;
}

interface OrderCountParams {
  startDate: string;
  endDate: string;
  status?: string;
}

export const useOrderCount = (params: OrderCountParams) => {
  return useQuery<OrderCountStatistics>({
    queryKey: ['orderCount', params],
    queryFn: async () => {
      const { startDate, endDate, status } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Missing startDate or endDate');
      }

      const res = await api.get('/orders/statistics/orders', {
        params: { startDate, endDate, status }
      });
      
      return res.data.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};