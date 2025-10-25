// src/hooks/size/useAllSizes.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';


export const useAllSizes = (search?: string) => {
  return useQuery({
    queryKey: ['allSizes', search],
    queryFn: async () => {
      const res = await api.get('/sizes/all', { // Gọi endpoint /sizes/all
        params: { search },
      });
      return res.data.data;
    },
  });
};