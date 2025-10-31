// useSetDefaultShippingAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingAddress } from '@/types/shipping-address.type';

export const useSetDefaultShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, addressId }: { userId: number; addressId: number }) => {
      const res = await api.put(`/shipping-addresses/set-default/${userId}/${addressId}`);
      return res.data;
    },
    onSuccess: (data, { userId, addressId }) => {
      // Cập nhật cache: set is_default = false cho tất cả, true cho address được chọn
      queryClient.setQueryData(
        ['shipping-addresses', 'user', userId],
        (oldData: ShippingAddress[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(addr => ({
            ...addr,
            is_default: addr.id === addressId
          }));
        }
      );
    },
  });
};