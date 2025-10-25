// hooks/auth/useForgotPassword.ts
'use client'

import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { forgotPassword, ForgotPasswordBody } from '@/lib/auth/forgotPassword'

interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export const useForgotPassword = (): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordBody> => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordBody>({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      console.log('Yêu cầu quên mật khẩu thành công:', data.message);
    },
    onError: (error) => {
      // Tùy chọn: Xử lý lỗi, ví dụ hiển thị thông báo lỗi chi tiết hơn
      console.error('Yêu cầu quên mật khẩu thất bại:', error.message);
    }
  })
}