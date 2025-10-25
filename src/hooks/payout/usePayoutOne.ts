'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const usePayoutOne = (id?: number | string) => {
  return useQuery({
    queryKey: ['payout', id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const res = await api.get(`/payouts/${id}`)
      return res.data.data
    },
  })
}
