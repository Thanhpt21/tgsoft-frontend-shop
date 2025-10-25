// lib/auth/forgotPassword.ts

// Định nghĩa kiểu dữ liệu cho body của request quên mật khẩu
export interface ForgotPasswordBody {
  email: string;
}

// Định nghĩa kiểu phản hồi từ API khi gửi yêu cầu quên mật khẩu
interface ForgotPasswordApiResponse {
  success: boolean;
  message: string;
}

export const forgotPassword = async (body: ForgotPasswordBody): Promise<ForgotPasswordApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu.');
  }

  return response.json();
};