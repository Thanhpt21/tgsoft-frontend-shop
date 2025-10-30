// src/hooks/cart/useMyCart.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import type { Cart } from '@/types/cart.type';

export const useMyCart = () => {
  const { currentUser, isLoading: authLoading } = useAuth();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart/me');
      return res.data; // hoặc res.data.data
    },
    enabled: !!currentUser && !authLoading,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000,
  });
};