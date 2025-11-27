// hooks/user/useUpdateUserTag.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UpdateUserTagParams {
  userId: number
  tag: string | null
}

export const useUpdateUserTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, tag }: UpdateUserTagParams) => {
      const res = await api.put(`/users/${userId}/tag`, { tag })
      return res.data
    },
    onSuccess: (_, variables) => {
      // Invalidate queries để refetch data
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-with-role'] })
      queryClient.invalidateQueries({ queryKey: ['users-without-role'] })
    },
  })
}