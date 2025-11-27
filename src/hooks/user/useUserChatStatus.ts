// hooks/user/useUserChatStatus.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UserChatStatus {
  id: number
  name: string
  email: string
  chatEnabled: boolean
}

interface UserChatStatusResponse {
  success: boolean
  message: string
  data: UserChatStatus
}

export const useUserChatStatus = (userId: number) => {
  return useQuery({
    queryKey: ['user-chat-status', userId],
    queryFn: async (): Promise<UserChatStatusResponse> => {
      const res = await api.get(`/users/${userId}/chat-status`)
      return res.data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  })
}