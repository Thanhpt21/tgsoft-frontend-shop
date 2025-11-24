import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseSupportMailboxesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useSupportMailboxes = ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
}: UseSupportMailboxesParams = {}) => {
  return useQuery({
    queryKey: ['support-mailboxes', page, limit, search, status],
    queryFn: async () => {
      const res = await api.get('/support-mailbox', { 
        params: { page, limit, search, status } 
      });
      return res.data.data;
    },
  });
};