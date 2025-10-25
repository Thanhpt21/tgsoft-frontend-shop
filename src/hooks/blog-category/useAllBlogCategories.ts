// src/hooks/blog-category/useAllBlogCategories.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useAllBlogCategories = (search?: string) => {
  return useQuery({
    queryKey: ['allBlogCategories', search],
    queryFn: async () => {
      const res = await api.get('/blog-categories/all', { // Calls the /blog-categories/all endpoint
        params: { search },
      });
      return res.data.data; // Expects the data to be in res.data.data and asserts it as BlogCategory[]
    },
  });
};