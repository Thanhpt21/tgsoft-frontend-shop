import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)

export const useGetAiChatEnabled = () => {
  return useQuery({
    queryKey: ['chat', 'ai-enabled', TENANT_ID],
    queryFn: async (): Promise<boolean> => {
      if (!TENANT_ID || isNaN(TENANT_ID)) {
        throw new Error('TENANT_ID is missing or invalid')
      }

      const res = await api.get<boolean>(
        `/tenants/${TENANT_ID}/ai-status`
      )
      return res.data
    },
    enabled: !!TENANT_ID,
    staleTime: 0, // 🔥 LUÔN coi data là stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}