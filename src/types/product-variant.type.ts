// DTO tạo variant
export interface CreateProductVariantDto {
  sku: string
  priceDelta?: number,
   barcode?: string | null
  attrValues: Record<string, any> // Lưu các giá trị thuộc tính, kiểu Json
  thumb?: string
}

// DTO cập nhật variant
export interface UpdateProductVariantDto {
  sku?: string
  priceDelta?: number,
   barcode?: string | null
  attrValues?: Record<string, any>
  thumb?: string
}

// Kiểu response của variant (trong list hoặc chi tiết)
export interface ProductVariant {
  id: number
  productId: number
  sku: string
  barcode?: string | null
  priceDelta: number
  price?: number | null
  attrValues: Record<string, any>
  thumb?: string | null
  createdAt: string
  updatedAt: string
}
