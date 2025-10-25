// src/hooks/auth/useGoogleLogin.ts
import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: async () => {
      // Gọi API endpoint của bạn mà sẽ khởi tạo OAuth flow với Google
      // Endpoint này sẽ trả về một HTTP redirect (302) về Google
      // Axios sẽ tự động theo dõi redirect, nhưng trình duyệt mới là bên thực hiện redirect cuối cùng
      // Về phía client, bạn chỉ cần gọi endpoint này và để trình duyệt làm phần còn lại.
      const response = await api.get('/auth/google');
      // Trả về dữ liệu nếu có, hoặc undefined nếu chỉ là redirect
      return response.data;
    },
    // Không cần onSuccess/onError cụ thể ở đây
    // vì việc redirect sẽ diễn ra ngoài tầm kiểm soát trực tiếp của react-query
    // Mọi lỗi sẽ được xử lý bởi onError trong component gọi hook này (LoginPage)
  });
};