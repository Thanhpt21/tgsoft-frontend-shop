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

export const useUserChatStatus = (userId: number, isChatOpen: boolean = false) => {
  return useQuery({
    queryKey: ['user-chat-status', userId],
    queryFn: async (): Promise<UserChatStatusResponse> => {
      const res = await api.get(`/users/${userId}/chat-status`)
      return res.data
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      // 🔥 Logic polling thông minh
      if (!query.state.data) return false // Không polling nếu chưa có data
      return isChatOpen ? 2000 : 5000 // 2s khi mở, 5s khi đóng
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 1000, // 1 giây
    gcTime: 5 * 60 * 1000,
  })
}