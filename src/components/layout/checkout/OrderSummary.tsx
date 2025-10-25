'use client'

import { Typography, Spin } from 'antd'
import { useMyCart } from '@/hooks/cart/useMyCart'
import useShippingMethod from '@/stores/shippingMethodStore'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatVND } from '@/utils/helpers'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'

const { Title, Text } = Typography

const OrderSummary: React.FC = () => {
  const { data: cart, isLoading } = useMyCart()
  const { shippingFee } = useShippingMethod()
  const { data: allAttributes } = useAllAttributes()
  const { data: allAttributeValues } = useAttributeValues()

  // Map id -> name/value
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name
    return acc
  }, {} as Record<number, string>) ?? {}

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value
    return acc
  }, {} as Record<number, string>) ?? {}

  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính'
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `Thuộc tính ${attrId}`
        const valueName = attributeValueMap[Number(valueId)] || valueId
        return `${attrName}: ${valueName}`
      })
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spin tip="Đang tải giỏ hàng..." />
      </div>
    )
  }

  if (!cart || !cart.items?.length) return <Text>Giỏ hàng của bạn đang trống.</Text>

  const temporaryTotal = cart.items.reduce(
    (sum: number, item: any) => sum + item.priceAtAdd * item.quantity,
    0
  )
  const currentShippingFee = shippingFee || 0
  const finalTotal = temporaryTotal + currentShippingFee

  return (
    <div>
      {cart.items.map((item: any) => {
        const thumbUrl = getImageUrl(
          item.variant?.thumb || 
          item.variant?.product?.thumb || 
          null
        );

        return (
          <div key={item.id} className="flex items-start py-3 border-b">
            {/* Hình ảnh */}
            <div className="w-16 h-16 mr-4 flex-shrink-0">
              <img
                src={thumbUrl || '/no-image.png'}
                alt={item.variant?.product?.name || 'Sản phẩm'}
                className="w-full h-full object-cover rounded-md"
               
              />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
              <Text strong>{item.variant?.product?.name}</Text>
              <div className="text-xs text-gray-500 mt-1">
                SKU: {item.variant?.sku || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.variant?.attrValues ? renderAttributes(item.variant.attrValues) : 'Không có thuộc tính'}
              </div>
              <div className="flex items-center text-sm mt-2">
                <Text>{formatVND(item.priceAtAdd)}</Text>
                <Text className="ml-2">x {item.quantity}</Text>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tổng tiền */}
      <div className="py-4">
        <div className="flex justify-between py-1">
          <Text strong>Tạm tính:</Text>
          <Text>{formatVND(temporaryTotal)}</Text>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary