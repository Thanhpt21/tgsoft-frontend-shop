// lib/auth/resetPassword.ts

// Define the request body for resetting the password
export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

// Define the expected API response for resetting the password
interface ResetPasswordApiResponse {
  success: boolean;
  message: string;
}

export const resetPassword = async (body: ResetPasswordBody): Promise<ResetPasswordApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reset password.');
  }

  return response.json();
};