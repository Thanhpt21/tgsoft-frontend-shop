'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Typography, Button, Spin, message, Modal, Result, Radio, Space, Checkbox, Card } from 'antd'
import { CheckCircleOutlined, ShoppingCartOutlined, HomeOutlined, EnvironmentOutlined, TruckOutlined, CreditCardOutlined, ShopOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useMyCart } from '@/hooks/cart/useMyCart'
import { useCreateOrder } from '@/hooks/order/useCreateOrder'
import { CreateOrderDto, OrderItemDto } from '@/types/order.type'
import { ShippingAddress } from '@/types/shipping-address.type'
import PaymentMethodSelection from './PaymentMethodSelection'
import Link from 'next/link'
import ShippingMethodSelection from './ShippingMethodSelection'
import { DeliveryMethod } from '@/enums/order.enums'
import axios from 'axios'
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem'
import { useAllWarehouses } from '@/hooks/warehouse/useAllWarehouses'
import { Warehouse } from '@/types/warehouse.type'
import { useAuth } from '@/context/AuthContext'
import { useShippingAddressesByUserId } from '@/hooks/shipping-address/useShippingAddressesByUserId'
import ShippingAddressSelection from './ShippingAddressSelection'
import { useCartStore } from '@/stores/cartStore'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatVND } from '@/utils/helpers'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'
import { useProductOne } from '@/hooks/product/useProductOne'
import { GiftProductDisplay } from '../common/GiftProductDisplay'
import { CartItemSummary } from './CartItemSummary'

const { Title, Text } = Typography

const OrderForm: React.FC = () => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null)
  const { data: cart, isLoading } = useMyCart()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutate: removeCartItem } = useRemoveCartItem()
  const [warehouseId, setWarehouseId] = useState(0)
  const [pickInfo, setPickInfo] = useState({
    address: "",
    district_id: null,
    district_name: "",
    name: "",
    note: "",
    phone: "",
    province_id: null,
    province_name: "",
    ward_id: null,
    ward_name: "",
  })

  const { data: warehouses, isLoading: isWarehousesLoading } = useAllWarehouses()
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(undefined)
  const { currentUser } = useAuth()
  const userId = currentUser?.id
  const { data: shippingAddresses, isLoading: isLoadingShippingAddresses } = useShippingAddressesByUserId(userId || 0)

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

  
  // ===== Order Summary State =====
  const { 
    items, 
    syncFromServer, 
    updateQuantityOptimistic, 
    removeItemOptimistic, 
    selectedItems, 
    toggleSelectItem, 
    selectAll,
    isSelectAll, 
    getSelectedTotal, 
    clearSelectedItems 
  } = useCartStore()

  const { data: allAttributes } = useAllAttributes()
  const { data: allAttributeValues } = useAttributeValues()
  

  useEffect(() => {
    setMounted(true)
  }, [])

  const attributeMap = useMemo(() => {
    return allAttributes?.reduce((acc: any, attr: any) => {
      acc[attr.id] = attr.name;
      return acc;
    }, {} as Record<number, string>) ?? {};
  }, [allAttributes]);

  const attributeValueMap = useMemo(() => {
    return allAttributeValues?.data?.reduce((acc, val) => {
      acc[val.id] = val.value;
      return acc;
    }, {} as Record<number, string>) ?? {};
  }, [allAttributeValues?.data]);

  // Đồng bộ khi cart từ server thay đổi
  useEffect(() => {
    if (cart?.items) {
      syncFromServer(cart.items);
    }
  }, [cart?.items, syncFromServer]);

  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính'
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `${attrId}`
        const valueName = attributeValueMap[Number(valueId)] || valueId
        return `${attrName}: ${valueName}`
      })
      .join(', ')
  }

  const handleSelectAll = useCallback((e: any) => {
    const checked = e.target.checked;
    if (checked && items.length > 10) {
      message.warning('Chỉ được chọn tối đa 10 sản phẩm');
      return;
    }
    const ids = items.slice(0, 10).map(i => i.id);
    selectAll(checked, ids);
  }, [items, selectAll]);

  const handleCheckboxChange = useCallback((itemId: number) => {
    toggleSelectItem(itemId);
  }, [toggleSelectItem]);


  // Tính toán
  const temporaryTotal = getSelectedTotal();
  const currentShippingFee = shippingFee || 0
  const finalTotal = temporaryTotal + currentShippingFee
  const isSelectAllDisabled = items.length > 10

  const totalWeight = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.variant.product.weight || 0) * item.quantity, 0);

  const totalValue = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0) {
      const defaultAddress = shippingAddresses.find((address: ShippingAddress) => address.is_default)
      if (defaultAddress) {
        setShippingInfo(defaultAddress)
      }
    }
  }, [shippingAddresses])
  
  const handleWarehouseChange = (e: any) => {
    const selected = e.target.value
    setSelectedWarehouse(selected)
    setWarehouseId(selected.id)
    
    if (selected && selected.location) {
      const location = selected.location
      setPickInfo({
        address: location.address || '',
        district_id: location.district_id || null,
        district_name: location.district_name || '',
        name: selected.name || '',
        phone: selected.phone || '',
        province_id: location.province_id || null,
        province_name: location.province_name || '',
        ward_id: location.ward_id || null,
        ward_name: location.ward_name || '',
        note: ''
      })
    }
  }

  const handleSelectShippingMethod = (methodId: number | null, fee: number | null) => {
    setShippingFee(fee)
    setDeliveryMethod(methodId === 1 ? DeliveryMethod.XTEAM : DeliveryMethod.STANDARD)
  }

  const handleSelectShippingAddress = (selectedAddress: ShippingAddress) => {
    setShippingInfo(selectedAddress)
  }

  const handlePlaceOrder = () => {
    if (!cart?.items?.length) {
      return message.warning('Giỏ hàng trống.')
    }

    if (!paymentMethod) {
      return message.warning('Vui lòng chọn phương thức thanh toán.')
    }

    if (shippingFee === null || shippingFee === undefined) {
      return message.warning('Vui lòng chọn phương thức vận chuyển.')
    }

    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return message.warning('Vui lòng chọn địa chỉ giao hàng.')
    }

    if (!warehouseId) {
      return message.warning('Vui lòng chọn kho để giao hàng.')
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
      note: shippingInfo.note,
    }

    // Tạo order items + kèm quà tặng
    const orderItems: OrderItemDto[] = items
      .filter(item => selectedItems.has(item.id))
      .map(item => {
        const promotion = item.variant.product.promotionProducts?.[0];
        return {
          sku: item.variant.sku,
          productVariantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.finalPrice,
          warehouseId: Number(warehouseId),
          // Gửi quà tặng (nếu có)
          giftProductId: promotion?.giftProductId ?? undefined,
          giftQuantity: promotion?.giftQuantity ?? 0,
        };
      });

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

        selectedItems.forEach(itemId => {
          removeCartItem(itemId);
          removeItemOptimistic(itemId);
        });
        clearSelectedItems();

        if (paymentMethod.code === 'VNPAY') {
          const paymentUrl = `https://api.aiban.vn/payments/vnpay?orderId=${orderId}&amount=${totalAmount}&returnUrl=https://api.aiban.vn/payments/vnpay/callback`

          try {
            const paymentResponse = await axios.get(paymentUrl, {
              headers: {
                'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
              },
            })

            if (paymentResponse?.data?.url) {
              window.location.href = paymentResponse.data.url
            } else {
              message.error('Không nhận được đường dẫn thanh toán từ VNPay!')
            }
          } catch (error) {
            message.error('Không thể tạo link thanh toán VNPay!')
          }
        } else {
          setCompletedOrderId(orderId)
          setOrderCompleted(true)
        }
      },
      onError: (error) => {
        message.error('Đặt hàng thất bại!')
      },
    })
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

  if (isLoading) return <Spin tip="Đang tải giỏ hàng..." className="flex justify-center items-center min-h-screen" />


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

        {/* Header - Desktop */}
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCardOutlined className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thanh toán
            </h1>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>

        {/* Header - Mobile */}
        <div className="md:hidden mb-4 px-2">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Thanh toán
          </h1>
          <p className="text-gray-600 text-sm">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 md:px-0">
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
                <div className="text-center py-8"><Spin /></div>
              ) : (
                <Radio.Group onChange={handleWarehouseChange} value={selectedWarehouse} className="w-full">
                  <Space direction="vertical" className="w-full" size="middle">
                    {warehouses?.map((warehouse: Warehouse) => (
                      <Radio key={warehouse.id} value={warehouse} className="w-full !items-start">
                        <div className="flex flex-col py-2">
                          <div className="font-semibold text-base text-gray-900">{warehouse.name}</div>
                          {warehouse.location && (
                            <div className="text-sm text-gray-500 mt-1">
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
          <div className="lg:col-span-5  md:px-0">
            <div className="bg-white  md:p-6 rounded-xl shadow-sm sticky top-6">
              <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
              
              <Card>
                {/* Select All */}
                <div className="flex items-center mb-4">
                  <Checkbox
                    checked={isSelectAll()}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked && items.length > 10) {
                        message.warning('Chỉ được chọn tối đa 10 sản phẩm');
                        return;
                      }
                      const ids = items.slice(0, 10).map(i => i.id);
                      selectAll(checked, ids);
                    }}
                    disabled={items.length > 10}
                  />
                  <Text className="ml-2">Chọn tất cả</Text>
                  {isSelectAllDisabled && <Text type="secondary" className="ml-2 text-xs">(Tối đa 10)</Text>}
                </div>

                {/* Cart Items - Desktop */}
                <div className="hidden md:block max-h-96 overflow-y-auto mb-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Giỏ hàng trống</div>
                  ) : (
                    items.map((item) => {
                      const thumbUrl = getImageUrl(
                        item.variant.thumb || 
                        item.variant.product.thumb || 
                        '/no-image.png'
                      )

                      return (
                       <CartItemSummary
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggle={() => handleCheckboxChange(item.id)}
                        renderAttributes={renderAttributes}
                      />
                      )
                    })
                  )}
                </div>

                {/* Cart Items - Mobile (giống layout giỏ hàng) */}
                <div className="md:hidden max-h-96 overflow-y-auto mb-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">Giỏ hàng trống</div>
                  ) : (
                    items.map((item) => {
                      const thumbUrl = getImageUrl(
                        item.variant.thumb || 
                        item.variant.product.thumb || 
                        '/no-image.png'
                      )
                      const promotion = item.variant.product.promotionProducts?.[0];

                      return (
                        <div key={item.id} className="flex gap-2 p-2 bg-gray-50 rounded-xl">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                            className="mt-1"
                          />
                          
                          <img
                            src={thumbUrl || ''}
                            alt={item.variant.product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                              {item.variant.product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-1">
                              {renderAttributes(item.variant.attrValues)}
                            </p>
                            
                            {/* Quà tặng */}
                            {promotion && promotion.giftProductId && promotion.giftQuantity && ( 
                              <div className="mb-1">
                                <GiftProductDisplay 
                                  giftProductId={promotion.giftProductId}
                                  giftQuantity={promotion.giftQuantity}
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <Text className="text-blue-600 font-semibold text-sm">{formatVND(item.finalPrice)}</Text>
                              <Text type="secondary" className="text-xs">x {item.quantity}</Text>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <Text className="text-gray-600 text-sm md:text-base">Tạm tính:</Text>
                    <Text className="font-semibold text-sm md:text-base">{formatVND(temporaryTotal)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 text-sm md:text-base">Phí vận chuyển:</Text>
                    <Text className="font-semibold text-sm md:text-base">{formatVND(currentShippingFee)}</Text>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Text strong className="text-base md:text-lg">Tổng cộng:</Text>
                    <Text strong className="text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  className="mt-6 !h-12 md:!h-14 !rounded-xl !text-sm md:!text-base font-bold !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  Đặt hàng ngay ({selectedItems.size})
                </Button>
              </Card>
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