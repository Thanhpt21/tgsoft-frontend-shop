// src/hooks/store/useUpdateStore.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Store } from '@/types/store.type'; // Đảm bảo import interface Store

export const useUpdateStore = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
      file,
    }: {
      id: number | string;
      data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>;
      file?: File | null;
    }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      if (file) formData.append('image', file); // Assuming the backend expects the image file under the key 'image'

      const res = await api.put(`/stores/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};