// @/hooks/chat/useToggleAiChat.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)

export const useToggleAiChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['chat', 'toggle-ai', TENANT_ID],
    mutationFn: async (): Promise<boolean> => {
      if (!TENANT_ID || isNaN(TENANT_ID)) throw new Error('Invalid Tenant ID')

      const res = await api.put<{ data: { aiChatEnabled: boolean } }>(
        `/tenants/${TENANT_ID}/toggle-ai`
      )
      return res.data.data.aiChatEnabled
    },
    onSuccess: (newEnabled) => {
      // TỰ ĐỘNG CẬP NHẬT CACHE
      queryClient.setQueryData(['chat', 'ai-enabled', TENANT_ID], newEnabled)
    },
    onError: (error) => {
      console.error('Toggle AI failed:', error)
    },
  })
}