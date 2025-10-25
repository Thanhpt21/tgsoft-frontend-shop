// src/hooks/store/useStoreOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useStoreOne = (id: number | string) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await api.get(`/stores/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};