// components/order/GiftProductDisplay.tsx
'use client'

import { useProductOne } from '@/hooks/product/useProductOne'
import { getImageUrl } from '@/utils/getImageUrl'
import { Spin } from 'antd'

interface GiftProductDisplayProps {
  giftProductId: number
  giftQuantity?: number | null // 👈 Cho phép optional
}

export const GiftProductDisplay = ({ giftProductId, giftQuantity }: GiftProductDisplayProps) => {
  const { data: giftProduct, isLoading } = useProductOne(giftProductId)

  if (isLoading) {
    return (
      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center">
        <Spin size="small" />
      </div>
    )
  }

  if (!giftProduct) return null

  return (
    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
      <div className="text-xs font-medium text-green-700 flex items-center gap-1">
        🎁 Quà tặng kèm
      </div>
      <div className="flex items-center gap-2 mt-1">
        <img
          src={getImageUrl(giftProduct.thumb || '/no-image.png') || ''}
          alt={giftProduct.name}
          className="w-10 h-10 object-cover rounded"
        />
        <div className="text-xs">
          <div className="font-medium">{giftProduct.name}</div>
          <div className="text-green-600">x{giftQuantity || 1}</div> {/* 👈 Fallback về 1 */}
        </div>
      </div>
    </div>
  )
}