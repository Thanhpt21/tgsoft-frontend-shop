// // src/hooks/order/useCancelOrder.ts
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/lib/axios';
// import { CancelOrderDto } from '@/types/order.type';

// export const useCancelOrder = (orderId: number) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (cancelData: CancelOrderDto) => {
//       const res = await api.put(`/orders/${orderId}/cancel`, cancelData);
//       return res.data;
//     },
//     onSuccess: () => {
//      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
//      queryClient.invalidateQueries({ queryKey: ['orders'] });
//     },
//   });
// };