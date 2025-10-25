// src/hooks/address/useProvinces.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query'; // Import UseQueryOptions
import { api } from '@/lib/axios';
import { Province } from '@/types/address.type';

export const useProvinces = () => {
  const queryOptions: UseQueryOptions<Province[], Error> = {
    queryKey: ['provinces'],
    queryFn: async () => {
      const res = await api.get<Province[]>('/ghtk/provinces');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 60, // 1 giờ
  };

  return useQuery(queryOptions);
};