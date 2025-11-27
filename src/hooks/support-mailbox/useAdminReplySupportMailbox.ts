import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminReplyPayload } from '@/types/support-mailbox.types';


export const useAdminReplySupportMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: AdminReplyPayload }) => {
      const res = await api.post(`/support-mailbox/${id}/admin-reply`, data);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate cả danh sách và chi tiết
      queryClient.invalidateQueries({ queryKey: ['support-mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['support-mailbox', variables.id] });
    },
  });
};