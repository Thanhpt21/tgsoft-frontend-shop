import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UseContactsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useContacts = ({
  page = 1,
  limit = 10,
  search = '',
}: UseContactsParams = {}) => {
  return useQuery({
    queryKey: ['contacts', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/contacts', { params: { page, limit, search } });
      return res.data.data;
    },
  });
};
