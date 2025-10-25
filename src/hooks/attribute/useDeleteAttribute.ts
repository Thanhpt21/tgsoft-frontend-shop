import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteAttribute = () => {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/attributes/${id}`)
      return res.data
    },
  })
}
