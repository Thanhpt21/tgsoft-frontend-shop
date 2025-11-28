import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: FormData }) => {
      const res = await api.put(`/users/${id}`, data);
      return res.data.data;
    },
  });
};
