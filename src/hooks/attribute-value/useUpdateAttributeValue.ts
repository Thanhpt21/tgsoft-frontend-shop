import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UpdateAttributeValueDto {
  value: string
}

export const useUpdateAttributeValue = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAttributeValueDto }) => {
      const res = await api.put(`/attribute-values/${id}`, data)
      return res.data
    },
  })
}
