import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const usePromotionOne = (id: number | string) => {
  return useQuery({
    queryKey: ['promotion', id],
    queryFn: async () => {
      const res = await api.get(`/promotions/${id}`);
      return res.data.data;
    },
    enabled: !!id,  // Hook chỉ gọi API khi ID có giá trị
  });
};
