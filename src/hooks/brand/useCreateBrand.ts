// useCreateBrand.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateBrand = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/brands', data)
      return res.data.data
    },
  })
}