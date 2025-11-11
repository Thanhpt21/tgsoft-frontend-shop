import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)

export const useSetAiChatEnabled = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!TENANT_ID) throw new Error('TENANT_ID is missing')
      const res = await api.put(`/chat/${TENANT_ID}/ai-enabled`, {
        aiChatEnabled: enabled,
      })
      return res.data.aiChatEnabled as boolean
    },
    onSuccess: (newState: boolean) => {
      // Cập nhật cache
      queryClient.setQueryData(['chat', 'ai-enabled', TENANT_ID], newState)
    },
  })
}
