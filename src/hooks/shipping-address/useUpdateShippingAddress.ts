// useUpdateShippingAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingAddress } from '@/types/shipping-address.type';

export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<ShippingAddress> }) => {
      const res = await api.put(`/shipping-addresses/${id}`, data);
      return res.data.data;
    },
    onSuccess: (updatedAddress) => {
      // Cập nhật cache ngay lập tức
      queryClient.setQueryData(
        ['shipping-addresses', 'user', updatedAddress.userId],
        (oldData: ShippingAddress[] | undefined) => {
          if (!oldData) return [updatedAddress];
          return oldData.map(addr => 
            addr.id === updatedAddress.id ? updatedAddress : addr
          );
        }
      );
    },
  });
};