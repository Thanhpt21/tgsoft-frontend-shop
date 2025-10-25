// src/hooks/blog/useBlogBySlug.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Blog } from '@/types/blog.type';  // Điều chỉnh theo kiểu dữ liệu blog

interface UseBlogBySlugParams {
  slug: string;
}

export const useBlogBySlug = ({ slug }: UseBlogBySlugParams) => {
  return useQuery({
    queryKey: ['blogs', slug],
    queryFn: async () => {
      const res = await api.get(`/blogs/slug/${slug}`); 
      return res.data.data as Blog;
    },
    enabled: !!slug, 
  });
};
