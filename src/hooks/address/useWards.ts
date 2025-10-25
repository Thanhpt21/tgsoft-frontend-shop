// src/hooks/address/useWards.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Ward } from '@/types/address.type'; // Import type Ward

/**
 * @function useWards
 * @description Custom hook để lấy danh sách các phường/xã từ API backend dựa trên districtCode.
 */
export const useWards = (districtCode?: string | number) => {
  const queryOptions: UseQueryOptions<Ward[], Error> = {
    // queryKey bao gồm districtCode để React Query cache riêng cho từng quận/huyện
    queryKey: ['wards', districtCode],
    queryFn: async () => {
      // Đảm bảo có districtCode mới gọi API
      if (!districtCode) {
        return [];
      }
      const res = await api.get<Ward[]>(`/ghtk/wards/${districtCode}`);
      return res.data;
    },
    // enable query chỉ khi có districtCode
    enabled: !!districtCode,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 60, // 1 giờ
  };

  return useQuery(queryOptions);
};