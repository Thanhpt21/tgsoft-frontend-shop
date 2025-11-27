import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useSupportMailbox = (id: number | string) => {
  return useQuery({
    queryKey: ['support-mailbox', id],
    queryFn: async () => {
      const res = await api.get(`/support-mailbox/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};