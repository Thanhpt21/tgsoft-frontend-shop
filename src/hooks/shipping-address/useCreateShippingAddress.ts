
// useCreateShippingAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingAddress } from '@/types/shipping-address.type';

export const useCreateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ShippingAddress>) => {
      const res = await api.post('/shipping-addresses', data);
      return res.data.data;
    },
    onSuccess: (newAddress, variables) => {
      // Cập nhật cache ngay lập tức thay vì invalidate
      queryClient.setQueryData(
        ['shipping-addresses', 'user', newAddress.userId],
        (oldData: ShippingAddress[] | undefined) => {
          if (!oldData) return [newAddress];
          return [...oldData, newAddress];
        }
      );
    },
  });
};