import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, CurrentUser } from '@/lib/auth/current';

export const useCurrent = () => {
  const query = useQuery<CurrentUser | null, Error>({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: true,
  });
  return query;
};
