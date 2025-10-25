import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useUpdateBlogCategory = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
      file,
    }: {
      id: number | string
      data: any
      file?: File
    }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any)
      })
      if (file) formData.append('file', file)

      const res = await api.put(`/blog-categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
  })
}
