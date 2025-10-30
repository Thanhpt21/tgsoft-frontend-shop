import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useSetDefaultShippingAddress = () => {
  return useMutation({
    mutationFn: async ({ userId, addressId }: { userId: number; addressId: number }) => {
      const res = await api.put(`/shipping-addresses/set-default/${userId}/${addressId}`);
      return res.data;
    },
  });
};
