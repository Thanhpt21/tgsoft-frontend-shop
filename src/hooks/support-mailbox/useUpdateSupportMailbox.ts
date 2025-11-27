import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { UpdateSupportMailboxPayload } from '@/types/support-mailbox.types';


export const useUpdateSupportMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: UpdateSupportMailboxPayload }) => {
      const res = await api.put(`/support-mailbox/${id}`, data);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate cả danh sách và chi tiết
      queryClient.invalidateQueries({ queryKey: ['support-mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['support-mailbox', variables.id] });
    },
  });
};