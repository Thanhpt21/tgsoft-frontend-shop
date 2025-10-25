import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteAttributeValue = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/attribute-values/${id}`)
      return res.data
    },
  })
}
