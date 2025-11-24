// hooks/useDashboardStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface DashboardStatistics {
  totalRevenue: number;
  totalOrders: number;
  successRate: number;
  averageOrderValue: number;
  periodComparison: {
    revenueGrowth: number;
    orderGrowth: number;
  };
}

export const useDashboardStatistics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery<DashboardStatistics>({
    queryKey: ['dashboardStatistics', period],
    queryFn: async () => {
      // Tính toán ngày bắt đầu và kết thúc dựa trên period
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Gọi API để lấy dữ liệu
      const [salesRes, previousPeriodRes] = await Promise.all([
        api.get('/orders/statistics/sales', {
          params: { startDate: startDateStr, endDate: endDateStr }
        }),
        // Lấy dữ liệu kỳ trước để so sánh
        api.get('/orders/statistics/sales', {
          params: { 
            startDate: getPreviousPeriodStart(period, startDate),
            endDate: getPreviousPeriodEnd(period, startDate)
          }
        })
      ]);

      const currentData = salesRes.data.data;
      const previousData = previousPeriodRes.data.data;

      // Tính toán tăng trưởng
      const revenueGrowth = previousData.summary.totalRevenue > 0 
        ? ((currentData.summary.totalRevenue - previousData.summary.totalRevenue) / previousData.summary.totalRevenue) * 100
        : 0;

      const orderGrowth = previousData.summary.totalOrders > 0
        ? ((currentData.summary.totalOrders - previousData.summary.totalOrders) / previousData.summary.totalOrders) * 100
        : 0;

      const averageOrderValue = currentData.summary.totalOrders > 0
        ? currentData.summary.totalRevenue / currentData.summary.totalOrders
        : 0;

      return {
        totalRevenue: currentData.summary.totalRevenue,
        totalOrders: currentData.summary.totalOrders,
        successRate: currentData.summary.successRate,
        averageOrderValue,
        periodComparison: {
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          orderGrowth: Math.round(orderGrowth * 100) / 100
        }
      };
    },
  });
};

// Helper function để tính ngày kỳ trước
function getPreviousPeriodStart(period: string, currentStart: Date): string {
  const date = new Date(currentStart);
  
  switch (period) {
    case 'day':
      date.setDate(date.getDate() - 1);
      break;
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

function getPreviousPeriodEnd(period: string, currentStart: Date): string {
  const date = new Date(currentStart);
  
  switch (period) {
    case 'day':
      // Không thay đổi
      break;
    case 'week':
      date.setDate(date.getDate() + 6);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      date.setDate(0); // Ngày cuối cùng của tháng trước
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      date.setMonth(0);
      date.setDate(0); // Ngày cuối cùng của năm trước
      break;
  }
  
  return date.toISOString().split('T')[0];
}