'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { message } from 'antd'

export const useCreatePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/payouts', data)
      return res.data
    },
    onSuccess: (res) => {
      message.success(res.message || 'Tạo payout thành công')
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Tạo payout thất bại')
    },
  })
}
