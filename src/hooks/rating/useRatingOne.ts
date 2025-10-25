// src/hooks/rating/useRatingOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Rating } from '@/types/product.type';

export const useRatingOne = (id: number | string) => {
  return useQuery<Rating>({
    queryKey: ['rating', id],
    queryFn: async () => {
      const res = await api.get(`/ratings/${id}`);
      return res.data; // API của bạn trả về trực tiếp Rating object
    },
    enabled: !!id, // Chỉ fetch khi id có giá trị
  });
};