import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useContactOne = (id: number | string) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const res = await api.get(`/contacts/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};
