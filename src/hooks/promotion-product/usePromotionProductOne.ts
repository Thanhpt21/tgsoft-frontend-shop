import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const usePromotionProductOne = (id: number | string) => {
  return useQuery({
    queryKey: ['promotionProduct', id],
    queryFn: async () => {
      const res = await api.get(`/promotion-products/${id}`);
      return res.data.data;
    },
    enabled: !!id,  // Hook chỉ gọi API khi ID có giá trị
  });
};
