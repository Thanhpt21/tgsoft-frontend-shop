import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteBlogCategory = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/blog-categories/${id}`)
      return res.data
    },
  })
}
