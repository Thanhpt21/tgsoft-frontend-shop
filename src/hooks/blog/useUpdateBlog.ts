// src/hooks/blog/useUpdateBlog.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateBlogPayload {
  id: number;
  data: FormData;
}

export const useUpdateBlog = () => {
  return useMutation({
    mutationFn: async (payload: UpdateBlogPayload) => {
      const res = await api.put(`/blogs/${payload.id}`, payload.data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};