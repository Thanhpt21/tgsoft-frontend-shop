// src/hooks/rating/useRatings.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Rating } from '@/types/product.type';

interface UseRatingsParams {
  productId?: number;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean; // Thêm enabled để kiểm soát việc fetch
}

interface RatingsResponse {
  data: Rating[];
  total: number;
  page: number;
  pageCount: number;
}

export const useRatings = ({
  productId,
  search = '',
  page = 1,
  limit = 10,
  enabled = true, // Mặc định là true
}: UseRatingsParams) => {
  return useQuery<RatingsResponse>({
    queryKey: ['ratings', productId, search, page, limit],
    queryFn: async () => {
      const res = await api.get('/ratings', {
        params: { productId, search, page, limit },
      });
      return res.data; // API của bạn trả về { success, message, data, total, page, pageCount }
    },
    // Chỉ fetch khi productId có giá trị (nếu được cung cấp) và enabled là true
    enabled: enabled && (productId !== undefined ? !!productId : true),
  });
};