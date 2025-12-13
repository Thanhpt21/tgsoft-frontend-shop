'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Typography, Button, Spin, message, Modal, Result, Radio, Space, Checkbox, Card, Skeleton } from 'antd'
import { CheckCircleOutlined, ShoppingCartOutlined, EnvironmentOutlined, TruckOutlined, CreditCardOutlined, ShopOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useMyCart } from '@/hooks/cart/useMyCart'
import { useCreateOrder } from '@/hooks/order/useCreateOrder'
import { CreateOrderDto, OrderItemDto } from '@/types/order.type'
import { ShippingAddress } from '@/types/shipping-address.type'
import Link from 'next/link'
import { DeliveryMethod } from '@/enums/order.enums'
import axios from 'axios'
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem'
import { useAllWarehouses } from '@/hooks/warehouse/useAllWarehouses'
import { useAuth } from '@/context/AuthContext'
import { useShippingAddressesByUserId } from '@/hooks/shipping-address/useShippingAddressesByUserId'
import { useCartStore } from '@/stores/cartStore'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatVND } from '@/utils/helpers'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'
import dynamic from 'next/dynamic'

// Dynamic imports cho các component phụ với đúng cú pháp
const PaymentMethodSelection = dynamic(() => import('./PaymentMethodSelection'), {
  loading: () => <Skeleton active paragraph={{ rows: 3 }} />
})

const ShippingMethodSelection = dynamic(() => import('./ShippingMethodSelection'), {
  loading: () => <Skeleton active paragraph={{ rows: 3 }} />
})

const ShippingAddressSelection = dynamic(() => import('./ShippingAddressSelection'), {
  loading: () => <Skeleton active paragraph={{ rows: 3 }} />
})

// Tạm thời không dùng dynamic import cho GiftProductDisplay vì có vấn đề type
// Thay vào đó dùng component inline đơn giản
const SimpleGiftDisplay = ({ giftProductId, giftQuantity }: { 
  giftProductId: number | undefined, 
  giftQuantity: number 
}) => {
  return (
    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-flex items-center gap-1">
      <span>🎁 Tặng kèm:</span>
      <span>{giftQuantity} sản phẩm</span>
    </div>
  )
}

const { Title, Text } = Typography

// Component loading skeleton
const SectionSkeleton = () => (
  <Card className="!rounded-3xl !border-2 shadow-lg">
    <Skeleton active paragraph={{ rows: 4 }} />
  </Card>
)

// Simple Cart Item component
interface SimpleCartItemProps {
  item: any
  isSelected: boolean
  onToggle: () => void
  renderAttributes: (attrs: Record<string, any>) => string
}

const SimpleCartItem: React.FC<SimpleCartItemProps> = ({ 
  item, 
  isSelected, 
  onToggle,
  renderAttributes 
}) => {
  const thumbUrl = getImageUrl(
    item.variant?.thumb || 
    item.variant?.product?.thumb || 
    '/no-image.png'
  )

  const promotion = item.variant?.product?.promotionProducts?.[0]

  return (
    <div className="flex gap-2 p-2 bg-gray-50 rounded-xl mb-2">
      <Checkbox
        checked={isSelected}
        onChange={onToggle}
        className="mt-1"
      />
      
      <img
        src={thumbUrl || ''}
        alt={item.variant?.product?.name || 'Sản phẩm'}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
          {item.variant?.product?.name || 'Không có tên'}
        </h3>
        <p className="text-xs text-gray-500 mb-1">
          {renderAttributes(item.variant?.attrValues || {})}
        </p>
        
        {/* Quà tặng */}
        {promotion && promotion.giftProductId && promotion.giftQuantity && (
          <div className="mb-1">
            <SimpleGiftDisplay 
              giftProductId={promotion.giftProductId}
              giftQuantity={promotion.giftQuantity}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Text className="text-blue-600 font-semibold text-sm">
            {formatVND(item.finalPrice)}
          </Text>
          <Text type="secondary" className="text-xs">x {item.quantity}</Text>
        </div>
      </div>
    </div>
  )
}

// Component chính
const OrderForm: React.FC = () => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null)
  
  // Fetch cart
  const { data: cart, isLoading: isCartLoading } = useMyCart()
  
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutate: removeCartItem } = useRemoveCartItem()
  
  const [warehouseId, setWarehouseId] = useState<number>(0)
  const [pickInfo, setPickInfo] = useState({
    address: "",
    district_id: null as number | null,
    district_name: "",
    name: "",
    note: "",
    phone: "",
    province_id: null as number | null,
    province_name: "",
    ward_id: null as number | null,
    ward_name: "",
  })

  // Fetch warehouses
  const { data: warehouses, isLoading: isWarehousesLoading } = useAllWarehouses()

  const { currentUser } = useAuth()
  const userId = currentUser?.id
  
  // Fetch shipping addresses
  const { data: shippingAddresses, isLoading: isLoadingShippingAddresses } = useShippingAddressesByUserId(
    userId || 0
  )

  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.STANDARD)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  
  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
    id: 0,
    tenantId: 1,
    userId: null,
    name: '',
    phone: '',
    address: '',
    ward_id: undefined,
    district_id: undefined,
    province_id: undefined,
    ward_name: '',
    district_name: '',
    province_name: '',
    city_name: '',
    province: '',
    district: '',
    ward: '',
    is_default: false,
    createdAt: '',
    updatedAt: '',
    note: '',
  })

  // Store
  const { 
    items, 
    syncFromServer, 
    removeItemOptimistic, 
    selectedItems, 
    toggleSelectItem, 
    selectAll,
    isSelectAll, 
    getSelectedTotal, 
    clearSelectedItems 
  } = useCartStore()

  // Fetch attributes
  const { data: allAttributes } = useAllAttributes()
  const { data: allAttributeValues } = useAttributeValues()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoized maps cho attributes
  const attributeMap = useMemo(() => {
    if (!allAttributes) return {}
    return allAttributes.reduce((acc: Record<number, string>, attr: any) => {
      acc[attr.id] = attr.name
      return acc
    }, {})
  }, [allAttributes])

  const attributeValueMap = useMemo(() => {
    if (!allAttributeValues?.data) return {}
    return allAttributeValues.data.reduce((acc: Record<number, string>, val: any) => {
      acc[val.id] = val.value
      return acc
    }, {})
  }, [allAttributeValues?.data])

  // Đồng bộ cart
  useEffect(() => {
    if (cart?.items && !isCartLoading) {
      syncFromServer(cart.items)
    }
  }, [cart?.items, isCartLoading, syncFromServer])

  const renderAttributes = useCallback((attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính'
    
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `Thuộc tính ${attrId}`
        const valueName = attributeValueMap[Number(valueId)] || valueId
        return `${attrName}: ${valueName}`
      })
      .join(', ')
  }, [attributeMap, attributeValueMap])

  // Tự động select tất cả items
  useEffect(() => {
    if (items.length > 0 && selectedItems.size === 0 && mounted) {
      const idsToSelect = items.slice(0, 10).map(i => i.id)
      selectAll(true, idsToSelect)
      
      if (items.length > 10) {
        message.info(`Đã tự động chọn 10 sản phẩm đầu tiên (tối đa 10 sản phẩm)`, 3)
      }
    }
  }, [items, selectedItems.size, selectAll, mounted])

  // Tính toán
  const temporaryTotal = getSelectedTotal()
  const currentShippingFee = shippingFee || 0
  const finalTotal = temporaryTotal + currentShippingFee
  const isSelectAllDisabled = items.length > 10

  const totalWeight = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.variant?.product?.weight || 0) * item.quantity, 0)
  }, [items, selectedItems])

  const totalValue = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0)
  }, [items, selectedItems])

  // Auto select default shipping address
  useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0) {
      const defaultAddress = shippingAddresses.find((address: ShippingAddress) => address.is_default)
      if (defaultAddress) {
        setShippingInfo(defaultAddress)
      }
    }
  }, [shippingAddresses])

  const handleWarehouseChange = useCallback((e: any) => {
    const selectedWarehouse = e.target.value
    if (!selectedWarehouse) return
    
    setWarehouseId(selectedWarehouse.id)
    
    if (selectedWarehouse?.location) {
      const location = selectedWarehouse.location
      setPickInfo({
        address: location.address || '',
        district_id: location.district_id || null,
        district_name: location.district_name || '',
        name: selectedWarehouse.name || '',
        phone: selectedWarehouse.phone || '',
        province_id: location.province_id || null,
        province_name: location.province_name || '',
        ward_id: location.ward_id || null,
        ward_name: location.ward_name || '',
        note: ''
      })
    }
  }, [])

  const handleSelectShippingMethod = useCallback((methodId: number | null, fee: number | null) => {
    setShippingFee(fee)
    setDeliveryMethod(methodId === 1 ? DeliveryMethod.XTEAM : DeliveryMethod.STANDARD)
  }, [])

  const handleSelectShippingAddress = useCallback((selectedAddress: ShippingAddress) => {
    setShippingInfo(selectedAddress)
  }, [])

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) {
      message.warning('Giỏ hàng trống.')
      return
    }

    if (!paymentMethod) {
      message.warning('Vui lòng chọn phương thức thanh toán.')
      return
    }

    if (shippingFee === null || shippingFee === undefined) {
      message.warning('Vui lòng chọn phương thức vận chuyển.')
      return
    }

    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      message.warning('Vui lòng chọn địa chỉ giao hàng.')
      return
    }

    if (!warehouseId) {
      message.warning('Vui lòng chọn kho để giao hàng.')
      return
    }

    const shippingPayload = {
      name: shippingInfo.name,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      ward_id: shippingInfo.ward_id,
      district_id: shippingInfo.district_id,
      province_id: shippingInfo.province_id,
      ward_name: shippingInfo.ward_name,
      district_name: shippingInfo.district_name,
      province_name: shippingInfo.province_name,
      note: shippingInfo.note || '',
    }

    // Tạo order items
    const orderItems: OrderItemDto[] = items
      .filter(item => selectedItems.has(item.id))
      .map(item => {
        const promotion = item.variant?.product?.promotionProducts?.[0]
        return {
          sku: item.variant?.sku || '',
          productVariantId: item.variant?.id || 0,
          quantity: item.quantity,
          unitPrice: item.finalPrice,
          warehouseId: Number(warehouseId),
          giftProductId: promotion?.giftProductId,
          giftQuantity: promotion?.giftQuantity || 0,
        }
      })

    const payload: CreateOrderDto = {
      shippingInfo: shippingPayload,
      items: orderItems,
      totalAmount: finalTotal,
      status: 'DRAFT',
      paymentStatus: 'PENDING',
      paymentMethodId: paymentMethod.id,
      shippingFee: shippingFee,
      deliveryMethod: deliveryMethod,
    }

    createOrder(payload, {
      onSuccess: async (response) => {
        const orderId = response.id
        const totalAmount = response.totalAmount
        
        message.success('Đặt hàng thành công!')

        // Xóa các item đã chọn khỏi cart
        const selectedIds = Array.from(selectedItems)
        selectedIds.forEach(itemId => {
          removeCartItem(itemId)
          removeItemOptimistic(itemId)
        })
        clearSelectedItems()

        // Xử lý VNPay
        if (paymentMethod.code === 'VNPAY') {
          try {
            const returnUrl = `${window.location.origin}/payment-callback`
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
            
            const paymentUrl = `${baseUrl}/payments/vnpay?orderId=${orderId}&amount=${totalAmount}&returnUrl=${encodeURIComponent(returnUrl)}`
            
            // Mở trong tab mới
            const paymentWindow = window.open(paymentUrl, '_blank')
            if (!paymentWindow) {
              // Fallback: redirect trong cùng tab
              window.location.href = paymentUrl
            }
          } catch (error: any) {
            console.error('Lỗi VNPay:', error)
            message.error('Lỗi thanh toán VNPay')
          }
        } else {
          // COD thành công
          setCompletedOrderId(orderId)
          setOrderCompleted(true)
        }
      },
      onError: (error) => {
        console.error('Lỗi đặt hàng:', error)
        message.error('Đặt hàng thất bại!')
      },
    })
  }, [
    items, selectedItems, paymentMethod, shippingFee, shippingInfo, 
    warehouseId, finalTotal, deliveryMethod, createOrder, 
    removeCartItem, removeItemOptimistic, clearSelectedItems
  ])

  // Nếu đang loading chính
  if (!mounted || isCartLoading) {
    return (
      <div className="min-h-screen py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-2 md:px-4">
          <Skeleton active paragraph={{ rows: 1 }} className="mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <SectionSkeleton />
              <SectionSkeleton />
              <SectionSkeleton />
              <SectionSkeleton />
            </div>
            <div className="lg:col-span-5">
              <Card className="!rounded-3xl !border-2">
                <Skeleton active paragraph={{ rows: 8 }} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card className="max-w-2xl w-full mx-4 !rounded-3xl !border-2 shadow-2xl">
          <Result
            status="success"
            icon={<CheckCircleOutlined className="text-green-600" style={{ fontSize: 72 }} />}
            title={<span className="text-3xl font-bold">Đặt hàng thành công!</span>}
            subTitle={
              <div className="text-lg text-gray-600 mt-4">
                <p>Mã đơn hàng: <span className="font-semibold text-blue-600">#{completedOrderId}</span></p>
                <p className="mt-2">Đơn hàng của bạn đang được xử lý.</p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="orders" 
                size="large"
                onClick={() => router.push('/tai-khoan?p=history')}
                className="mb-3 !h-12 !px-8 !rounded-xl !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600"
              >
                Xem đơn hàng
              </Button>,
              <Button 
                key="shop" 
                size="large"
                onClick={() => router.push('/san-pham')}
                className="!h-12 !px-8 !rounded-xl"
              >
                Tiếp tục mua sắm
              </Button>,
            ]}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto max-w-7xl px-2 md:px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-gray-600 px-2 md:px-0">
          <Link href="/gio-hang" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <ShoppingCartOutlined />
            <span>Giỏ hàng</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCardOutlined className="text-white text-lg md:text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thanh toán
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Address */}
            <Card className="!rounded-3xl !border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <EnvironmentOutlined className="text-white text-lg" />
                </div>
                <Title level={5} className="!mb-0">Địa chỉ giao hàng</Title>
              </div>
              <ShippingAddressSelection
                shippingAddresses={shippingAddresses || []}
                onSelectAddress={handleSelectShippingAddress}
              />
            </Card>

            {/* Warehouse Selection */}
            <Card className="!rounded-3xl !border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <ShopOutlined className="text-white text-lg" />
                </div>
                <Title level={5} className="!mb-0">Chọn kho giao hàng</Title>
              </div>
              {isWarehousesLoading ? (
                <div className="text-center py-4"><Spin size="small" /></div>
              ) : (
                <Radio.Group 
                  onChange={handleWarehouseChange} 
                  value={warehouses?.find((w: any) => w.id === warehouseId)}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full" size="middle">
                    {warehouses?.map((warehouse: any) => (
                      <Radio 
                        key={warehouse.id} 
                        value={warehouse} 
                        className="w-full !items-start hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex flex-col py-1">
                          <div className="font-semibold text-base text-gray-900">{warehouse.name}</div>
                          {warehouse.location && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {warehouse.location.address}
                              {warehouse.location.ward_name && `, ${warehouse.location.ward_name}`}
                              {warehouse.location.district_name && `, ${warehouse.location.district_name}`}
                              {warehouse.location.province_name && `, ${warehouse.location.province_name}`}
                            </div>
                          )}
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Card>

            {/* Shipping Method */}
            <Card className="!rounded-3xl !border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <TruckOutlined className="text-white text-lg" />
                </div>
                <Title level={5} className="!mb-0">Phương thức vận chuyển</Title>
              </div>
              <ShippingMethodSelection
                onMethodSelected={handleSelectShippingMethod}
                deliveryProvince={shippingInfo.province || ''}
                deliveryDistrict={shippingInfo.district || ''}
                deliveryWard={shippingInfo.ward || null}
                deliveryAddress={shippingInfo.address || null}
                totalWeight={totalWeight}
                totalValue={totalValue}
                pickProvince={pickInfo.province_name || ''}
                pickDistrict={pickInfo.district_name || ''}
                pickWard={pickInfo.ward_name || null}
                pickAddress={pickInfo.address || ''}
              />
            </Card>

            {/* Payment Method */}
            <Card className="!rounded-3xl !border-2 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <CreditCardOutlined className="text-white text-lg" />
                </div>
                <Title level={5} className="!mb-0">Phương thức thanh toán</Title>
              </div>
              <PaymentMethodSelection onMethodSelected={setPaymentMethod} />
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg sticky top-6 border border-gray-100">
              <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
              
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center">
                  <Checkbox
                    checked={isSelectAll()}
                    onChange={(e) => {
                      const checked = e.target.checked
                      if (checked && items.length > 10) {
                        message.warning('Chỉ được chọn tối đa 10 sản phẩm')
                        return
                      }
                      const ids = items.slice(0, 10).map(i => i.id)
                      selectAll(checked, ids)
                    }}
                    disabled={items.length > 10}
                  />
                  <Text className="ml-2">Chọn tất cả</Text>
                  {isSelectAllDisabled && (
                    <Text type="secondary" className="ml-2 text-xs">(Tối đa 10)</Text>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">Giỏ hàng trống</div>
                  ) : (
                    items.slice(0, 10).map((item) => (
                      <SimpleCartItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggle={() => toggleSelectItem(item.id)}
                        renderAttributes={renderAttributes}
                      />
                    ))
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <Text className="text-gray-600">Tạm tính:</Text>
                    <Text className="font-semibold">{formatVND(temporaryTotal)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600">Phí vận chuyển:</Text>
                    <Text className="font-semibold">{formatVND(currentShippingFee)}</Text>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Text strong className="text-lg">Tổng cộng:</Text>
                    <Text strong className="text-xl md:text-2xl text-blue-600">
                      {formatVND(finalTotal)}
                    </Text>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePlaceOrder}
                  loading={isCreatingOrder}
                  disabled={!shippingInfo.name || !paymentMethod || !warehouseId || shippingFee === null || selectedItems.size === 0}
                  className="!h-12 md:!h-14 !rounded-xl font-bold !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all mt-6"
                >
                  Đặt hàng ngay ({selectedItems.size})
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal VNPay */}
        <Modal
          title={<span className="text-xl font-bold">Thanh toán VNPay</span>}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width="80%"
          centered
        >
          <iframe
            src={paymentUrl}
            width="100%"
            height="600"
            title="VNPay Payment"
            className="rounded-xl"
          />
        </Modal>
      </div>
    </div>
  )
}

export default OrderForm