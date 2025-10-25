import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateBlog = () => {
  return useMutation({
    mutationFn: async (data: FormData | any) => {
      const res = await api.post('/blogs', data)
      return res.data.data
    },
  })
}
