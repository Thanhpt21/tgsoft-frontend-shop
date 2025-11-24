// hooks/useSalesStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface SalesStatistics {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    successRate: number;
    currency: string;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  breakdown: {
    byStatus: Array<{
      status: string;
      orderCount: number;
      revenue: number;
    }>;
  };
}

interface SalesStatisticsParams {
  startDate: string;
  endDate: string;
}

export const useSalesStatistics = (params: SalesStatisticsParams) => {
  return useQuery<SalesStatistics>({
    queryKey: ['salesStatistics', params],
    queryFn: async () => {
      const { startDate, endDate } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Missing startDate or endDate');
      }

      const res = await api.get('/orders/statistics/sales', {
        params: { startDate, endDate }
      });
      
      return res.data.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};