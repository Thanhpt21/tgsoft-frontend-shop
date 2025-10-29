'use client'

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { login, LoginBody } from '@/lib/auth/login'
import { LoginResponse } from '@/types/user.type'
import { useRouter } from 'next/navigation'
import { message } from 'antd'
import { useChat } from '@/context/ChatContext'

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginBody> => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { handleUserLogin } = useChat() // 🔥 NEW: Lấy handleUserLogin từ ChatContext

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: login,
    onSuccess: (data) => {
      // Clear old cookies
      document.cookie = 'userId=; Max-Age=0; path=/;'
      document.cookie = 'tenantId=; Max-Age=0; path=/;'
      
      // Set new cookies
      document.cookie = `userId=${data.user.id}; path=/;`
      document.cookie = `tenantId=${process.env.NEXT_PUBLIC_TENANT_ID || '1'}; path=/;`

      // 🔥 NEW: Emit user-login tới socket server
      if (data.user && data.user.id) {
        const tenantId = data.user.tenantId || 
        parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1')
        
        console.log('🔐 User logged in, emitting to socket:', {
          userId: data.user.id,
          tenantId
        })

        // Đợi một chút để socket connection ổn định
        setTimeout(() => {
          handleUserLogin(data.user.id, tenantId)
        }, 200)
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      
      // Show success message
      message.success('Đăng nhập thành công!')
      
      // Note: Không redirect ở đây nữa, để LoginPage.tsx xử lý redirect
      // router.push('/') 
    },
    onError: (error: any) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại, vui lòng thử lại.'
      console.error('❌ Login failed:', apiMessage)
      message.error(apiMessage)
    },
  })
}