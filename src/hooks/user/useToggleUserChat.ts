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
    // 🔥 OPTIMISTIC UPDATE - Cập nhật UI ngay lập tức
    onMutate: async (variables) => {
      const { userId, enabled } = variables
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['user-chat-status', userId] 
      })

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(['user-chat-status', userId])

      // Optimistically update to the new value
      queryClient.setQueryData(['user-chat-status', userId], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            chatEnabled: enabled
          }
        }
      })

      // Return a context object with the snapshotted value
      return { previousStatus }
    },
    onSuccess: (data, variables, context) => {

      
      // 🔥 POLLING: Tự động refetch sau 1 giây để đảm bảo data đồng bộ
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['user-chat-status', variables.userId] 
        })
      }, 1000)

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-with-role'] })
      queryClient.invalidateQueries({ queryKey: ['users-without-role'] })
    },
    onError: (error, variables, context) => {
      console.error('❌ Toggle user chat failed:', error)
      
      // 🔥 ROLLBACK: Quay lại trạng thái cũ nếu có lỗi
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['user-chat-status', variables.userId], 
          context.previousStatus
        )
      }
      
      // Force refetch để đảm bảo data chính xác
      queryClient.invalidateQueries({ 
        queryKey: ['user-chat-status', variables.userId] 
      })
    },
    onSettled: (data, error, variables) => {
      // 🔥 Đảm bảo refetch cuối cùng sau khi mutation hoàn thành
      queryClient.invalidateQueries({ 
        queryKey: ['user-chat-status', variables.userId] 
      })
    }
  })
}