// hooks/config/useConfigOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useConfigOne = (id: number | string) => {
  return useQuery({
    queryKey: ['config', id],
    queryFn: async () => {
      const res = await api.get(`/configs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}