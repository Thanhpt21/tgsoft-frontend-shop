import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateContact = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/contacts', data);
      return res.data.data;
    },
  });
};
