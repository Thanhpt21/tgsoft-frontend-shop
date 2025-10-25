'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth/current';

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

export const useCurrent = () => {
  const query = useQuery<CurrentUser | null, Error>({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: true,
  });
  return query;
};