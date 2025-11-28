// src/hooks/chat/useSaveBotMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export type SaveBotMessageParams = {
  conversationId: number | null
  sessionId?: string | null
  message: string
  metadata?: any
}

export const useSaveBotMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SaveBotMessageParams) => {
      const { conversationId, sessionId, message, metadata } = params

      // Cho phép conversationId = null (guest dùng sessionId)
      if (!message?.trim()) {
        throw new Error('Message cannot be empty')
      }

      const payload: any = {
        message: message.trim(),
        metadata: { ai: true, ...metadata },
        senderType: 'BOT', // ✅ Đảm bảo senderType
      }

      // ✅ Ưu tiên conversationId, nếu không có thì dùng sessionId
      if (conversationId != null) {
        payload.conversationId = conversationId
      } else if (sessionId) {
        payload.sessionId = sessionId
      } else {
        throw new Error('Either conversationId or sessionId is required')
      }

      const response = await api.post('/chat/save-bot-message', payload)
      return response.data
    },

    // Tự động refresh tin nhắn sau khi lưu AI
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversation'] })
      queryClient.invalidateQueries({ queryKey: ['user-conversation-ids'] })
    },

    onError: (error: any) => {
      console.error('❌ Lỗi lưu tin nhắn BOT:', error.response?.data || error.message)
    },
  })
}