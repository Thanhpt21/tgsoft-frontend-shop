import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteSupportMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/support-mailbox/${id}`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate queries để refetch danh sách
      queryClient.invalidateQueries({ queryKey: ['support-mailboxes'] });
    },
  });
};