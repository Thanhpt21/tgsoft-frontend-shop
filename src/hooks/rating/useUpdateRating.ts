// src/hooks/rating/useUpdateRating.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateRatingDto {
  star?: number;
  comment?: string;
}

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number | string; dto: UpdateRatingDto }) => {
      const res = await api.put(`/ratings/${id}`, dto);
      return res.data; // API của bạn trả về { success, message, data: updatedRating }
    },
    onSuccess: (data, variables) => {
      // Invalidate cache của đánh giá cụ thể
      queryClient.invalidateQueries({ queryKey: ['rating', variables.id] });
      // Invalidate cache của danh sách ratings (nếu cần)
      queryClient.invalidateQueries({ queryKey: ['ratings'] }); // Có thể cần cụ thể hơn nếu API trả về productId
      // Invalidate cache của product detail để cập nhật averageRating và ratingCount
      // Cần biết productId của rating được update. Có thể truyền vào variables hoặc lấy từ cache
      // queryClient.invalidateQueries(['product', productId]);
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật đánh giá:", error);
    },
  });
};