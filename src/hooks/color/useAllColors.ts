// src/hooks/color/useAllColors.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';


export const useAllColors = (search?: string) => {
  return useQuery({
    queryKey: ['allColors', search],
    queryFn: async () => {
      const res = await api.get('/colors/all', { // Assuming you created a '/colors/all' endpoint
        params: { search },
      });
      return res.data.data;
    },
  });
};