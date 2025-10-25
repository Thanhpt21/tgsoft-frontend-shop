'use client'

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { login, LoginBody } from '@/lib/auth/login'
import { LoginResponse } from '@/types/user.type' // ✅ Dùng type chuẩn đã có
import { useRouter } from 'next/navigation'
import { message } from 'antd'

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginBody> => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: login,
    onSuccess: (data) => {
      document.cookie = 'userId=; Max-Age=0; path=/;'
      document.cookie = 'tenantId=; Max-Age=0; path=/;'
      document.cookie = `userId=${data.user.id}; path=/;`
      document.cookie = `tenantId=${process.env.NEXT_PUBLIC_TENANT_ID || '1'}; path=/;`

      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      message.success('Đăng nhập thành công!')
      router.push('/')
    },
    onError: (error: any) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại, vui lòng thử lại.'
      console.error('Login failed:', apiMessage)
      message.error(apiMessage)
    },
  })
}
