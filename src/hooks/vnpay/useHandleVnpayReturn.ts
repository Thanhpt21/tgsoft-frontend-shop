// useHandleVnpayReturn.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useHandleVnpayReturn = (query: Record<string, string>) => {
  return useQuery({
    queryKey: ['vnpayReturn', query],
    queryFn: async () => {
      const res = await api.get('/payments/vnpay/callback', { params: query })
      return res.data
    },
    enabled: !!query,  // Chỉ gọi API khi có query
  })
}
