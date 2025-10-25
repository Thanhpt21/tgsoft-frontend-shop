import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/types/order.type';

export const useOrderOne = (orderId?: number) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Missing orderId');
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    enabled: !!orderId,
  });
};
