// src/hooks/product/useProductsByCategorySlug.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn này đúng với axios instance của bạn
import { Product, Category, ProductsByCategorySlugResponse } from '@/types/product.type';

interface UseProductsByCategorySlugParams {
  categorySlug: string; // Bắt buộc phải có slug danh mục
  page?: number;
  limit?: number;
  brandId?: number; // Thêm brandId
  colorId?: number; // Thêm colorId
  search?: string;
  sortBy?: string; // Ví dụ: 'createdAt_desc', 'price_asc', 'sold_desc', 'averageRating_desc'
}

export const useProductsByCategorySlug = ({
  categorySlug,
  page = 1,
  limit = 12, // Mặc định 12 sản phẩm mỗi trang
  search = '',
  sortBy = 'createdAt_desc',
  brandId, 
  colorId
}: UseProductsByCategorySlugParams) => {

  return useQuery<ProductsByCategorySlugResponse, Error>({
    queryKey: [
      'products',
      'byCategorySlug',
      categorySlug,
      page,
      limit,
      search,
      sortBy,
      brandId, // Add to queryKey
      colorId, // Add to queryKey
    ],
    queryFn: async () => {
      if (!categorySlug) {
        // Có thể throw lỗi hoặc trả về một promise rỗng nếu categorySlug không hợp lệ
        // Tùy thuộc vào cách bạn muốn xử lý
        throw new Error('Category slug is required to fetch products.');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search); // Thêm search nếu có giá trị
      if (sortBy) params.append('sortBy', sortBy); // Thêm sortBy nếu có giá trị
      if (brandId !== undefined && brandId !== null) params.append('brandId', brandId.toString());
      if (colorId !== undefined && colorId !== null) params.append('colorId', colorId.toString());


      // Gửi request GET tới API endpoint mới
      const res = await api.get(`/products/category/${categorySlug}?${params.toString()}`);

      // API của bạn trả về cấu trúc { success: true, message: ..., data: [...], categoryInfo: {...} }
      // Vì vậy chúng ta chỉ cần trả về res.data
      return res.data as ProductsByCategorySlugResponse;
    },
    // `enabled` đảm bảo query chỉ chạy khi `categorySlug` có giá trị
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "tươi" trong 5 phút
  });
};