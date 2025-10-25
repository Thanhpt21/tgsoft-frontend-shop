// src/hooks/color/useUpdateColor.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateColor = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: any
    }) => {
      // Color model không có file ảnh nên không cần FormData, dùng JSON thông thường
      const res = await api.put(`/colors/${id}`, data)
      return res.data
    },
  })
}
