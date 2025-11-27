// hooks/user/useToggleUserChat.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface ToggleUserChatParams {
  userId: number
  enabled: boolean
}

export const useToggleUserChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, enabled }: ToggleUserChatParams) => {
      const res = await api.put(`/users/${userId}/toggle-chat`, { enabled })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-with-role'] })
      queryClient.invalidateQueries({ queryKey: ['users-without-role'] })
      queryClient.invalidateQueries({ queryKey: ['user-chat-status', variables.userId] })
    },
  })
}