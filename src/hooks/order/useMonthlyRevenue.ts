// hooks/useMonthlyRevenue.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface MonthlyRevenueData {
  month: number;
  revenue: number;
  orderCount: number;
}

export interface MonthlyRevenueResponse {
  year: number;
  monthlyData: MonthlyRevenueData[];
}

export const useMonthlyRevenue = (year?: number) => {
  return useQuery<MonthlyRevenueResponse>({
    queryKey: ['monthlyRevenue', year],
    queryFn: async () => {
      const res = await api.get('/orders/statistics/monthly-revenue', {
        params: { year }
      });
      return res.data.data;
    },
  });
};