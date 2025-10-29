// hooks/order/useCheckUserPurchasedProduct.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

// Response type
interface CheckPurchaseData {
  hasPurchased: boolean;
  orderId: number | null;
  orderItemId: number | null;
  orderStatus?: string;
  purchasedAt?: string;
}

interface CheckPurchaseResponse {
  success: boolean;
  data: CheckPurchaseData;
}

// Hook params
interface UseCheckUserPurchasedProductParams {
  productId: number;
  enabled?: boolean;
}

export const useCheckUserPurchasedProduct = ({ 
  productId, 
  enabled = true 
}: UseCheckUserPurchasedProductParams) => {
  return useQuery({
    queryKey: ['check-purchase', productId],
    queryFn: async (): Promise<CheckPurchaseData> => {
      const res = await api.get(`/orders/check-purchase/${productId}`);
      return res.data.data;
    },
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    retry: 1,
  });
};