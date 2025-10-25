// src/hooks/store/useDeleteStore.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteStore = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/stores/${id}`);
      return res.data;
    },
  });
};