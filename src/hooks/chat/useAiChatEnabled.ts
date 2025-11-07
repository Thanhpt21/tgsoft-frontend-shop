import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)

export const useAiChatEnabled = () => {
  return useQuery({
    queryKey: ['chat', 'ai-enabled', TENANT_ID],
    queryFn: async () => {
      if (!TENANT_ID) return false
      const res = await api.get(`/chat/${TENANT_ID}/ai-enabled`)
      return res.data.aiChatEnabled as boolean
    },
    enabled: !!TENANT_ID,
    staleTime: 1000 * 60 * 5,
  })
}
