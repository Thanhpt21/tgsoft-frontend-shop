import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';


export const usePromotionProductsByPromotionId = (promotionId: number | string) => {
  return useQuery({
    queryKey: ['promotionProductsByPromotionId', promotionId],
    queryFn: async () => {
      const res = await api.get(`/promotion-products/promotion/${promotionId}`);
      return res.data.data;  
    },
    enabled: !!promotionId,  
  });
};
