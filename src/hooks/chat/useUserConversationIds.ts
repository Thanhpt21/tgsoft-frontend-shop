// src/hooks/chat/useUserConversationIds.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export type UseUserConversationIdsParams = {
  userId: number
  tenantId?: number
  enabled?: boolean
}

export const useUserConversationIds = ({
  userId,
  tenantId,
  enabled = true,
}: UseUserConversationIdsParams) => {
  return useQuery({
    queryKey: ['chat', 'conversation-ids', userId, tenantId],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('userId', userId.toString())
      if (tenantId !== undefined) {
        params.append('tenantId', tenantId.toString())
      }

      const res = await api.get(`/chat/conversation-ids?${params.toString()}`)
      return res.data.conversationIds as number[]
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 phút
  })
}