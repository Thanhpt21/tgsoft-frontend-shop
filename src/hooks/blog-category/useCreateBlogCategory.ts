import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateBlogCategory = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any)
      })
      const res = await api.post('/blog-categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
  })
}
