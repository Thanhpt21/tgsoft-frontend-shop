// hooks/useYearlyRevenue.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useYearlyRevenue = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['yearlyRevenue', year],
    queryFn: async () => {
      const monthlyData = [];
      
      // Tạo requests cho 12 tháng
      const requests = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const startDate = new Date(year, i, 1);
        const endDate = new Date(year, i + 1, 0, 23, 59, 59, 999); // Ngày cuối cùng của tháng
        
        return api.get('/orders/statistics/revenue', {
          params: { 
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: 'DELIVERED'
          }
        });
      });

      const responses = await Promise.all(requests);
      
      // Xử lý kết quả
      for (let i = 0; i < responses.length; i++) {
        monthlyData.push({
          month: i + 1,
          revenue: responses[i].data.data.totalRevenue || 0
        });
      }

      return {
        year,
        monthlyData
      };
    },
  });
};