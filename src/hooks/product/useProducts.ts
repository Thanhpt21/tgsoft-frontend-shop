import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseProductsParams {
  page?: number
  limit?: number
  search?: string
  brandId?: number
  categoryId?: number
  sortBy?: string
  isFeatured?: boolean      // ✅ THÊM
  hasPromotion?: boolean    // ✅ THÊM
}

export const useProducts = ({
  page = 1,
  limit = 10,
  search = '',
  brandId,
  categoryId,
  sortBy = 'createdAt_desc',
  isFeatured,     // ✅ THÊM
  hasPromotion,   // ✅ THÊM
}: UseProductsParams = {}) => {
  return useQuery({
    queryKey: [
      'products', 
      page, 
      limit, 
      search, 
      brandId, 
      categoryId, 
      sortBy,
      isFeatured,    // ✅ THÊM vào queryKey để cache đúng
      hasPromotion   // ✅ THÊM vào queryKey để cache đúng
    ],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { 
          page, 
          limit, 
          search, 
          brandId, 
          categoryId, 
          sortBy,
          isFeatured,    // ✅ THÊM
          hasPromotion   // ✅ THÊM
        },
      })
      return res.data.data
    },
    // ✅ TỐI ƯU: Giữ data cũ khi đang fetch trang mới
    placeholderData: (previousData) => previousData,
    // ✅ TỐI ƯU: Cache 5 phút
    staleTime: 5 * 60 * 1000,
  })
}