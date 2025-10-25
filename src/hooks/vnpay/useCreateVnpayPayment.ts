// useCreateVnpayPayment.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateVnpayPayment = () => {
  return useMutation({
    mutationFn: async ({ orderId, amount, returnUrl }: { orderId: string, amount: string, returnUrl: string }) => {
      const res = await api.get('/payments/vnpay', {
        params: { orderId, amount, returnUrl }
      })
      return res.data
    },
  })
}
