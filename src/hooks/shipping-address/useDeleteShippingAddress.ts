import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.delete(`/shipping-addresses/${id}`);
      return { id, ...res.data };
    },
    onSuccess: (data, deletedId) => {
      // Lấy userId từ cache trước khi xóa
      const allQueries = queryClient.getQueriesData({
        queryKey: ['shipping-addresses', 'user']
      });

      allQueries.forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          const updatedData = queryData.filter(
            (addr: any) => addr.id !== deletedId
          );
          queryClient.setQueryData(queryKey, updatedData);
        }
      });
    },
  });
};
