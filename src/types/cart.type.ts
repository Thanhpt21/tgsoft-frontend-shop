// types/cart.type.ts
export interface CartItem {
  id: number
  cartId: number
  productVariantId: number
  quantity: number
  priceAtAdd: number
  warehouseId?: string | null
  variant: {
    id: number
    sku: string
    priceDelta: number
    attrValues: Record<string, any>
    thumb?: string | null
    warehouseId?: string | null
    product: {
      id: number
      name: string
      basePrice: number
      thumb?: string
      weight: number
    }
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
  items: CartItem[]
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
