import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateVariantAttributeValue = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/variant-attribute-values', data)
      return res.data.data
    },
  })
}
