// hooks/auth/useResetPassword.ts
'use client'

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { resetPassword, ResetPasswordBody } from '@/lib/auth/resetPassword';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const useResetPassword = (): UseMutationResult<ResetPasswordResponse, Error, ResetPasswordBody> => {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordBody>({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log('Password reset successfully:', data.message);
    },
    onError: (error) => {
      console.error('Password reset failed:', error.message);
    }
  });
};