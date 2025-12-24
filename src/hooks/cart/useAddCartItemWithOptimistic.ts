// src/hooks/cart/useAddCartItemWithOptimistic.ts
import { useAddCartItem } from './useAddCartItem'
import { useCartStore } from '@/stores/cartStore' // <-- Import từ store riêng
import { message } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { CartItem } from '@/types/cart.type'
import { api } from '@/lib/axios'

interface AddCartItemInput {
  productVariantId: number
  quantity: number
}

export const useAddCartItemWithOptimistic = () => {
  const mutation = useAddCartItem()
  const { addItemOptimistic, replaceTempId, removeItemOptimistic, syncFromServer } = useCartStore()
  const queryClient = useQueryClient()

  return (
    input: AddCartItemInput,
    options?: {
      onOptimisticSuccess?: () => void
      onSuccess?: () => void
      onError?: () => void
    }
  ) => {
    const tempId = -Date.now()

    // ⭐ Tạo optimistic item với dữ liệu tạm thời
    const optimisticItem: CartItem = {
      id: tempId,
      cartId: 0,
      productVariantId: input.productVariantId,
      quantity: input.quantity,
      priceAtAdd: 0,
      finalPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variant: {
        id: input.productVariantId,
        productId: 0,
        sku: '',
        barcode: '',
        priceDelta: 0,
        price: null,
        attrValues: {},
        thumb: null,
        warehouseId: null,
        product: {
          id: 0,
          tenantId: 0,
          name: 'Đang tải...',
          slug: '',
          description: '',
          basePrice: 0,
          thumb: '',
          images: [],
          status: 'ACTIVE',
          isPublished: false,
          isFeatured: false,
          totalRatings: 0,
          totalReviews: 0,
          numberSold: 0,
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          categoryId: 0,
          brandId: 0,
          createdById: 0,
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          createdAt: '',
          updatedAt: '',
          promotionProducts: [],
        },
      },
    }

    // Thêm item tạm thời vào store
    addItemOptimistic(optimisticItem)
    options?.onOptimisticSuccess?.()

    // Gọi API thêm vào giỏ
    mutation.mutate(input, {
      onSuccess: async (newItem: any) => {
        console.log('✅ Item added:', newItem)

        try {
          // Replace tempId bằng ID thực
          replaceTempId(tempId, newItem.id)

          // 🔥 Fetch giỏ hàng đầy đủ từ /cart/me
          const cartRes = await api.get('/cart/me')
          const cartData = cartRes.data
          console.log('✅ Full cart data:', cartData)

          if (cartData?.items) {
            // Sync toàn bộ giỏ vào store
            syncFromServer(cartData.items)
          }

          // Invalidate query để React Query cập nhật
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          
          options?.onSuccess?.()
        } catch (err) {
          console.error('❌ Lỗi:', err)
          // Vẫn invalidate để có thể refetch từ server
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          message.warning('Thêm thành công nhưng chưa cập nhật đầy đủ')
          options?.onSuccess?.()
        }
      },
      onError: (err: any) => {
        console.error('❌ Error add cart:', err)
        removeItemOptimistic(tempId)
        message.error('Thêm thất bại')
        options?.onError?.()
      },
    })
  }
}