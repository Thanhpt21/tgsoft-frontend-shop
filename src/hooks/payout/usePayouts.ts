'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UsePayoutsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export const usePayouts = ({
  page = 1,
  limit = 10,
  status,
  search = '',
}: UsePayoutsParams = {}) => {
  return useQuery({
    queryKey: ['payouts', page, limit, status, search],
    queryFn: async () => {
      const res = await api.get('/payouts', {
        params: { page, limit, status, search },
      })
      return res.data.data
    },
  })
}
