import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext'; // ✅ Import AuthContext
import type { Cart } from '@/types/cart.type';

export const useMyCart = () => {
  const { currentUser, isLoading: authLoading } = useAuth();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart/me');
      return res.data;
    },
    // ✅ CHỈ chạy khi đã login
    enabled: !!currentUser && !authLoading, // false khi guest hoặc đang load auth
    // ✅ Không retry khi 401
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    // ✅ Stale time dài để giảm request
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};