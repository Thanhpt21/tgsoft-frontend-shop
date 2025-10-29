import { fetchWithAuth } from './fetch-with-auth';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  gender: string | null;
  type_account: string;
  avatar: string | null;
  isActive: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/current`,
      { cache: 'no-store' }
    );

    console.log('🔍 getCurrentUser response.status:', response.status);

    if (response.status === 401) return null;

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ getCurrentUser API error:', error);
      throw new Error(error.message || 'Không thể lấy thông tin người dùng');
    }

    const { success, data } = await response.json();
    console.log('🔍 getCurrentUser data:', data);

    return success && data ? data : null;
  } catch (error: any) {
    console.error('Lỗi getCurrentUser:', error.message);
    return null; // tránh throw error nếu muốn App chạy tiếp
  }
};
