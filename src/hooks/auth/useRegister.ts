'use client'

import { register, RegisterBody } from '@/lib/auth/register'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface RegisterResponse {
  success: boolean
  message: string
  data: {
    id: number
    name: string
    email: string
    role: string
    phoneNumber: string | null
    gender: string | null
    type_account: string
    isActive: boolean
  }
}

export const useRegister = (): UseMutationResult<RegisterResponse, Error, RegisterBody> => {
  const router = useRouter()

  return useMutation<RegisterResponse, Error, RegisterBody>({
    mutationFn: register,
    onSuccess: (data) => {
      router.push('/login')
    },
    onError: (error) => {
      console.error('Đăng ký thất bại:', error.message);
    }
  })
}