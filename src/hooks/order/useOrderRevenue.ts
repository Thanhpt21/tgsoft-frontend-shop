// hooks/useOrderRevenue.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface RevenueStatistics {
  totalRevenue: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface RevenueParams {
  startDate: string;
  endDate: string;
  status?: string;
}

export const useOrderRevenue = (params: RevenueParams) => {
  return useQuery<RevenueStatistics>({
    queryKey: ['orderRevenue', params],
    queryFn: async () => {
      const { startDate, endDate, status } = params;
      
      if (!startDate || !endDate) {
        throw new Error('Missing startDate or endDate');
      }

      const res = await api.get('/orders/statistics/revenue', {
        params: { startDate, endDate, status }
      });
      
      return res.data.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};