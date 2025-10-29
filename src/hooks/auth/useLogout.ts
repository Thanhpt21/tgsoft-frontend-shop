import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout as apiLogout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: logoutUser, isPending } = useMutation({
    mutationFn: async () => {
      await apiLogout();  // Thực hiện logout gọi từ API
    },
    onSuccess: () => {
      // Xóa tất cả dữ liệu người dùng khỏi cache
      queryClient.removeQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      document.cookie = 'userId=; Max-Age=0; path=/;'
      document.cookie = 'tenantId=; Max-Age=0; path=/;'
      localStorage.clear()
      // Chuyển hướng về trang login
      router.push('/login');
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  return { logoutUser, isPending };
};
