// src/hooks/blog/useLikeBlog.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useLikeBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/blogs/${id}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'slug'] }); // Invalidate query của blog chi tiết
    },
  });
};