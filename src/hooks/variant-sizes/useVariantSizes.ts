// hooks/variant/useVariantSizes.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Size } from '@/types/size.type'; // Đảm bảo import interface Size

interface ApiResponse {
  success: boolean;
  message: string;
  data: Size[];
}

export const useVariantSizes = (variantId?: number) => {
  return useQuery({
    queryKey: ['variantSizes', variantId],
    queryFn: async () => {
      if (!variantId) return null;
      const res = await api.get<ApiResponse>(`/variants/${variantId}/sizes`);
      return res.data.data;
    },
    enabled: !!variantId, // Chỉ chạy query khi có variantId
  });
};