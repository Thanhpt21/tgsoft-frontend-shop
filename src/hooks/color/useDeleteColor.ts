// src/hooks/color/useDeleteColor.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteColor = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/colors/${id}`)
      return res.data
    },
  })
}
