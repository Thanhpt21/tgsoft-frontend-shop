import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)

// Hook để lấy trạng thái AI chat có được bật hay không
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

      // Trả về giá trị boolean từ response
      return res.data
    },
    enabled: !!TENANT_ID // Chỉ thực hiện khi TENANT_ID hợp lệ
  })
}
