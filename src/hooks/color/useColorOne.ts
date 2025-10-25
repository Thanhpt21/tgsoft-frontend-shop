// src/hooks/color/useColorOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useColorOne = (id: number | string) => {
  return useQuery({
    queryKey: ['color', id],
    queryFn: async () => {
      const res = await api.get(`/colors/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
