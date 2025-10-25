// hooks/shipping-address/useCreateShippingAddress.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CreateShippingAddressPayload } from '@/types/shipping-address.type';

export const useCreateShippingAddress = () => {
  return useMutation({
    mutationFn: async (data: CreateShippingAddressPayload & { userId: number }) => {
      const res = await api.post('/shipping-address', data);
      return res.data;
    },
  });
};