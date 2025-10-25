// src/hooks/address/useDistricts.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { District } from '@/types/address.type';


/**
 * @function useDistricts
 * @description Custom hook để lấy danh sách các quận/huyện từ API backend dựa trên provinceCode.
 */
export const useDistricts = (provinceCode?: string | number) => {
  // Định nghĩa options cho useQuery
  const queryOptions: UseQueryOptions<District[], Error> = {
    // queryKey bao gồm provinceCode để React Query cache riêng cho từng tỉnh
    queryKey: ['districts', provinceCode],
    queryFn: async () => {
      // Đảm bảo có provinceCode mới gọi API
      if (!provinceCode) {
        return [];
      }
      const res = await api.get<District[]>(`/ghtk/districts/${provinceCode}`);
      return res.data;
    },
    // enable query chỉ khi có provinceCode
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 60, // 1 giờ
  };

  return useQuery(queryOptions);
};