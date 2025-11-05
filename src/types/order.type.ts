import { DeliveryMethod } from "@/enums/order.enums"
import { User } from "./user.type"

// ✅ Payment Method type
export interface PaymentMethod {
  id: number
  code: string
  name: string
  tenantId?: number
  createdAt?: string
  updatedAt?: string
}

// ✅ Product type
export interface Product {
  id: number
  tenantId?: number
  name: string
  slug?: string
  description?: string
  basePrice?: number
  thumb?: string
  images?: string[]
  status?: string
  isPublished?: boolean
  isFeatured?: boolean
  totalRatings?: number
  totalReviews?: number
  numberSold?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  categoryId?: number
  brandId?: number
  createdById?: number
  weight?: number
  length?: number
  width?: number
  height?: number
  createdAt?: string
  updatedAt?: string
}

// ✅ Product Variant type
export interface ProductVariant {
  id: number
  productId: number
  sku: string
  barcode?: string
  priceDelta?: number
  price?: number | null
  attrValues?: Record<string, string>
  thumb?: string
  createdAt?: string
  updatedAt?: string
  product?: Product
}

// ✅ Order Item type
export interface OrderItem {
  id?: number
  orderId?: number
  productVariantId: number
  sku: string
  quantity: number
  unitPrice: number
  createdAt?: string
  giftProductId?: number | null
  giftQuantity?: number
  updatedAt?: string
  productVariant?: ProductVariant
}


export interface ShippingInfo {
   name: string
  phone: string
  address: string
  city_id?: number
  ward_id?: number
  district_id?: number
  province_id?: number
  ward_name: string;
  district_name: string;
  province_name: string;
  note?: string
}

// ✅ Order type
export interface Order {
  id: number
  userId?: number
  tenantId?: number
  totalAmount: number
  currency?: string
  shippingInfo?: ShippingInfo
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  payments?: any[]
  user?: User
  paymentMethod?: PaymentMethod // ✅ thêm vào đây
  shippingFee?: number
  deliveryMethod?: DeliveryMethod | string
}

// ✅ OrderItemDto
export interface OrderItemDto {
  sku: string
  productVariantId: number
  quantity: number
  unitPrice: number
  warehouseId: number
  giftProductId?: number | null
  giftQuantity?: number
}

// ✅ CreateOrderDto
export interface CreateOrderDto {
  shippingInfo: {
    name: string
    phone: string
    address: string
    ward_id?: number
    district_id?: number
    province_id?: number
    city_id?: number
    note?: string
  }
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethodId: number // ✅ thêm field này
  items: OrderItemDto[],
  shippingFee?: number
  deliveryMethod?: DeliveryMethod | string
}
