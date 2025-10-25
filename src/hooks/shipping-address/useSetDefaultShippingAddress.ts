// hooks/shipping-address/useSetDefaultShippingAddress.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface SetDefaultShippingAddressPayload {
  id: number;
  isDefault: boolean;
}

export const useSetDefaultShippingAddress = () => {
  return useMutation({
    mutationFn: async ({ id, isDefault }: SetDefaultShippingAddressPayload) => {
      const res = await api.put(`/shipping-address/${id}`, { isDefault });
      return res.data;
    },
  });
};