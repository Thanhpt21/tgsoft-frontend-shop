import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CreateSupportMailboxDto } from '@/types/support-mailbox.types';

export const useCreateSupportMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupportMailboxDto) => {
      const res = await api.post('/support-mailbox', data);
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate queries để refetch danh sách
      queryClient.invalidateQueries({ queryKey: ['support-mailboxes'] });
    },
  });
};