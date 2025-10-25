import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface CreateAttributeValueDto {
  attributeId: number
  value: string
}

export const useCreateAttributeValue = () => {
  return useMutation({
    mutationFn: async (data: CreateAttributeValueDto) => {
      const res = await api.post('/attribute-values', data)
      return res.data
    },
  })
}
