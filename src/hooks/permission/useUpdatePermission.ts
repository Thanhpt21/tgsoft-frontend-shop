import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdatePermission = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: any
    }) => {
      const res = await api.put(`/permissions/${id}`, data)
      return res.data.data
    },
  })
}