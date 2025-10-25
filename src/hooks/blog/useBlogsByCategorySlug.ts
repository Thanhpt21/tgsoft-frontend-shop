// src/hooks/blog/useBlogsByCategorySlug.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Ensure this path is correct for your axios instance
import { Blog, BlogsByCategorySlugResponse } from '@/types/blog.type'; // Import your blog types

interface UseBlogsByCategorySlugParams {
  categorySlug: string; // Required category slug
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // E.g., 'createdAt_desc', 'updatedAt_desc'
}

export const useBlogsByCategorySlug = ({
  categorySlug,
  page = 1,
  limit = 10, // Default 10 blogs per page, adjust as needed
  search = '',
  sortBy = 'createdAt_desc', // Default sort by newest
}: UseBlogsByCategorySlugParams) => {

  return useQuery<BlogsByCategorySlugResponse, Error>({
    queryKey: [
      'blogs',
      'byCategorySlug',
      categorySlug,
      page,
      limit,
      search,
      sortBy,
    ],
    queryFn: async () => {
      // Throw an error if categorySlug is not provided, aligning with your product hook
      if (!categorySlug) {
        throw new Error('Category slug is required to fetch blogs.');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);

      // Send GET request to the API endpoint
      // Ensure your API endpoint for blogs by category slug is correctly configured
      // E.g., /api/blogs/category/:categorySlug
      const res = await api.get(`/blogs/category/${categorySlug}?${params.toString()}`);

      // Assuming your API returns a structure like { success: true, message: ..., data: [...], categoryInfo: {...} }
      return res.data as BlogsByCategorySlugResponse;
    },
    // The query will only run if `categorySlug` has a truthy value
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes
  });
};