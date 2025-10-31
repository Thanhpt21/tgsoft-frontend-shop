// src/hooks/auth/useLogout.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout as apiLogout } from '@/lib/auth/logout';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const qc = useQueryClient();
  const router = useRouter();

  const m = useMutation({
    mutationFn: apiLogout,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['current-user'] });
      const prev = qc.getQueryData(['current-user']);
      qc.removeQueries({ queryKey: ['current-user'] });
      qc.setQueryData(['current-user'], null);
      document.cookie = 'userId=; Max-Age=0; path=/; SameSite=Lax';
      document.cookie = 'tenantId=; Max-Age=0; path=/; SameSite=Lax';
      localStorage.clear();
      router.push('/login');
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(['current-user'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['current-user'], exact: true });
    },
  });

  return { logoutUser: m.mutate, isPending: m.isPending };
};