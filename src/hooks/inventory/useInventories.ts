// useInventories.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseInventoriesParams {
  productVariantId?: number
  warehouseId?: number
}

export const useInventories = ({
  productVariantId,
  warehouseId,
}: UseInventoriesParams = {}) => {
  return useQuery({
    queryKey: ['inventories', productVariantId, warehouseId],
    queryFn: async () => {
      const res = await api.get('/inventories', {
        params: { 
          productVariantId, 
          warehouseId 
        },
      })
      return res.data.data
    },
  })
}