// src/hooks/color/useCreateColor.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateColor = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/colors', data)
      return res.data
    },
  })
}
