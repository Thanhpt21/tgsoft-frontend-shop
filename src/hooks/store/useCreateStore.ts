// src/hooks/store/useCreateStore.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Store } from '@/types/store.type'; // Đảm bảo import interface Store

export const useCreateStore = () => {
  return useMutation({
    mutationFn: async (data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      const res = await api.post('/stores', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};