import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateInventory = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inventories', data)
      return res.data.data
    },
  })
}
