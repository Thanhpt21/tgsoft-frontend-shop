// types/cart.type.ts

import { PromotionProduct } from "./promotion-product.type"


export interface Product {
  id: number
  tenantId: number
  name: string
  slug: string
  description: string
  basePrice: number
  thumb?: string
  images?: string[]
  status: 'ACTIVE' | 'INACTIVE'
  isPublished: boolean
  isFeatured: boolean
  totalRatings: number
  totalReviews: number
  numberSold: number
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  categoryId: number
  brandId: number
  createdById: number
  weight: number
  length: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
  promotionProducts: PromotionProduct[] // Thêm thông tin khuyến mãi vào sản phẩm
}

export interface CartItem {
  id: number
  cartId: number
  productVariantId: number
  quantity: number
  priceAtAdd: number
  finalPrice: number
  createdAt: string
  updatedAt: string
  variant: {
    id: number
    productId: number
    sku: string
    barcode?: string
    priceDelta: number
    price?: number | null
    attrValues: Record<string, any>
    thumb?: string | null
    warehouseId?: string | null
    product: Product // Thêm thông tin sản phẩm ở đây
  }
}

export interface Cart {
  id: number
  tenantId: number
  userId: number
  status: 'ACTIVE' | 'CHECKOUT' | 'ABANDONED'
  total?: number
  createdAt: string
  updatedAt: string
  items: CartItem[] // Giỏ hàng sẽ có danh sách các sản phẩm (CartItem)
}

export interface AddCartItemDto {
  productVariantId: number
  quantity: number
}

export interface UpdateCartItemDto {
  quantity?: number
}

export interface MergeCartDto {
  items: AddCartItemDto[]
}
