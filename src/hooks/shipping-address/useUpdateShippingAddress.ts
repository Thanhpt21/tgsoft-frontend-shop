// hooks/shipping-address/useUpdateShippingAddress.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingAddress } from '@/types/shipping-address.type'; // Import DTO

interface UpdateShippingAddressPayload {
  id: number;
  data: Omit<ShippingAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'orders'>;
}

export const useUpdateShippingAddress = () => {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateShippingAddressPayload) => {
      const res = await api.put(`/shipping-address/${id}`, data);
      return res.data;
    },
  });
};