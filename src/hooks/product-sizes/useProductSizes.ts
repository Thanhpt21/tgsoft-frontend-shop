// hooks/product/useProductSizes.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Size } from '@/types/size.type'; // Đảm bảo import interface Size

export const useProductSizes = (productId?: number) => {
  return useQuery({
    queryKey: ['productSizes', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await api.get(`/products/${productId}/sizes`);
      return res.data.data as Size[]; // Giả định response.data có cấu trúc { success: true, message: ..., data: [...] }
    },
    enabled: !!productId, // Chỉ chạy query khi có productId
  });
};