import { Attribute } from "./attribute.type";
import { PromotionProduct } from "./promotion-product.type";

export type ProductAttributeType = 'TEXT' | 'SELECT' | 'MULTISELECT' | 'COLOR' | 'SIZE';

export interface ProductAttribute {
  productId: number      // ID sản phẩm
  attributeId: number    // ID thuộc tính
  attribute: Attribute
  type: ProductAttributeType
  position: number
  createdAt: string
  updatedAt: string
}



export interface Product {
  id: number
  tenantId: number
  name: string
  slug: string
  description?: string | null
  basePrice: number
  thumb?: string | null
  images?: string[] | null
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'DELETED'
  isPublished: boolean
  isFeatured: boolean
  totalRatings: number
  totalReviews: number
  numberSold: number
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  categoryId?: number | null
  brandId?: number | null
  createdById?: number | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  createdAt: string
  updatedAt: string
  attributes: ProductAttribute[]
  promotionProducts?: PromotionProduct[];
}
