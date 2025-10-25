import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateSize = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: { title: string }
    }) => {
      const res = await api.put(`/sizes/${id}`, data)
      return res.data
    },
  })
}
