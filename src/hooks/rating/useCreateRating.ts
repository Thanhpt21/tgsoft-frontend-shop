// src/hooks/rating/useCreateRating.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Rating } from '@/types/product.type';

interface CreateRatingDto {
  star: number;
  comment: string;
  productId: number;
}

export const useCreateRating = () => {
  const queryClient = useQueryClient(); // Để invalidate cache sau khi tạo thành công

  return useMutation({
    mutationFn: async (dto: CreateRatingDto) => {
      const res = await api.post('/ratings', dto);
      return res.data; // API của bạn trả về { success, message, data: rating }
    },
    onSuccess: (data, variables) => {
      // Invalidate cache của danh sách ratings cho productId này
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.productId] });
      // Có thể invalidate cache của product detail để cập nhật averageRating và ratingCount
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo đánh giá:", error);
      // Xử lý lỗi, ví dụ hiển thị thông báo cho người dùng
    },
  });
};