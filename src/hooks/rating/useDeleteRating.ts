// src/hooks/rating/useDeleteRating.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/ratings/${id}`);
      return res.data; // API của bạn trả về { success, message }
    },
    onSuccess: (data, id) => {
      // Xóa đánh giá khỏi cache
      queryClient.invalidateQueries({ queryKey: ['rating', id] });
      // Invalidate cache của danh sách ratings
      queryClient.invalidateQueries({ queryKey: ['ratings'] }); // Cần biết productId của rating bị xóa để invalidate chính xác hơn
      // Invalidate cache của product detail để cập nhật averageRating và ratingCount
      // queryClient.invalidateQueries(['product', productId]);
    },
    onError: (error) => {
      console.error("Lỗi khi xóa đánh giá:", error);
    },
  });
};