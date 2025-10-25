import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteContact = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/contacts/${id}`);
      return res.data;
    },
  });
};
