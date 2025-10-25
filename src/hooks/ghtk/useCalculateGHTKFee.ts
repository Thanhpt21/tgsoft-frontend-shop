// src/hooks/ghtk/useCalculateGHTKFee.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CalculateFeeDto, GHTKRawFeeResponse } from '@/types/ghtk.type';

export const useCalculateGHTKFee = () => {
  return useMutation<GHTKRawFeeResponse, Error, CalculateFeeDto>({
    mutationFn: async (data: CalculateFeeDto) => {
      const res = await api.post<GHTKRawFeeResponse>('/ghtk/calculate-fee', data);
      return res.data;
    },
    onSuccess: (response) => {
      if (response.success && response.fee?.success && response.fee?.fee) {
      } else {
        console.warn(
          'GHTK Fee calculation failed:',
          response.fee?.message || response.message || response.reason || 'Unknown reason'
        );
      }
    },
    onError: (error: any) => {
      console.error('Error calculating GHTK fee:', error.message || 'Unknown error');
    },
  });
};
