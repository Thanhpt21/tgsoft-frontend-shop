'use client'

import React, { useEffect, useState } from 'react'
import { Typography, Button, Spin, message, Breadcrumb, Modal, Result, Radio, Space, Checkbox } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
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
import useShippingMethod from '@/stores/shippingMethodStore'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatVND } from '@/utils/helpers'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'

const { Title, Text } = Typography

const OrderForm: React.FC = () => {
  const router = useRouter()
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

  // ===== State =====
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.STANDARD)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  
  // ===== Order Summary State =====
  const { items, syncFromServer, updateQuantityOptimistic, removeItemOptimistic } = useCartStore()
  const { data: allAttributes } = useAllAttributes()
  const { data: allAttributeValues } = useAttributeValues()
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Map id → name/value
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name
    return acc
  }, {} as Record<number, string>) ?? {}

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value
    return acc
  }, {} as Record<number, string>) ?? {}

  // Đồng bộ server ở background
  useEffect(() => {
    const syncCart = async () => {
      try {
        const res = await fetch('/api/cart')
        const data = await res.json()
        if (data?.items) {
          syncFromServer(data.items)
        }
      } catch (err) {
        console.error('Sync cart failed:', err)
      }
    }
    syncCart()
  }, [syncFromServer])

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

  const handleCheckboxChange = (itemId: number) => {
    const newSelectedItems = new Set(selectedItems)
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId)
    } else {
      newSelectedItems.add(itemId)
    }
    
    setSelectAll(newSelectedItems.size === items.length)
    setSelectedItems(newSelectedItems)
  }

  const handleSelectAll = (e: any) => {
    const isChecked = e.target.checked
    setSelectAll(isChecked)

    if (isChecked) {
      const allItemIds = items.map(item => item.id)
      setSelectedItems(new Set(allItemIds))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    updateQuantityOptimistic(itemId, quantity)
  }

  const handleRemoveItem = (itemId: number) => {
    removeItemOptimistic(itemId)
  }

  // Tính toán
  const temporaryTotal = items
    .filter(item => selectedItems.has(item.id))
    .reduce((total, item) => total + item.priceAtAdd * item.quantity, 0)

  const currentShippingFee = shippingFee || 0
  const finalTotal = temporaryTotal + currentShippingFee
  const isSelectAllDisabled = items.length > 10

  // ===== End Order Summary =====

  // Tính tổng trọng lượng của các sản phẩm được chọn
  const totalWeight = cart?.items.reduce((sum, item) => {
    if (selectedItems.has(item.id)) {
      return sum + item.variant.product.weight * item.quantity
    }
    return sum
  }, 0) || 0

  // Tính tổng giá trị của các sản phẩm được chọn
  const totalValue = cart?.items.filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0

  // Tự động chọn địa chỉ mặc định
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

  if (isLoading) return <Spin tip="Đang tải giỏ hàng..." className="flex justify-center items-center min-h-screen" />

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

    const orderItems: OrderItemDto[] = cart.items
      .filter(item => selectedItems.has(item.id))
      .map(item => ({
        sku: item.variant.sku,
        productVariantId: item.variant.id,
        quantity: item.quantity,
        unitPrice: item.priceAtAdd,
        warehouseId: Number(warehouseId)
      }))

    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity + shippingFee!
    }, 0)

    const payload: CreateOrderDto = {
      shippingInfo: shippingPayload,
      items: orderItems,
      totalAmount,
      status: 'DRAFT',
      paymentStatus: 'PENDING',
      paymentMethodId: paymentMethod.id,
      shippingFee: shippingFee,
      deliveryMethod: deliveryMethod,
    }

    console.log('Order Payload:', payload)

    createOrder(payload, {
      onSuccess: async (response) => {
        const orderId = response.id
        const totalAmount = response.totalAmount
        message.success('Đặt hàng thành công!')

        selectedItems.forEach(itemId => {
          removeCartItem(itemId)
          removeItemOptimistic(itemId) // Xóa khỏi Zustand store
        })
        
        // Reset selected items
        setSelectedItems(new Set())
        setSelectAll(false)

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

  const handleModalClose = () => {
    setIsModalVisible(false)
  }

  if (orderCompleted) {
    return (
      <div className="container mx-auto py-10">
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-600" />}
          title="Đặt hàng thành công!"
          subTitle={`Mã đơn hàng: #${completedOrderId}. Đơn hàng của bạn đang được xử lý.`}
          extra={[
            <Button type="primary" key="orders" onClick={() => router.push('/tai-khoan?p=history')}>
              Xem đơn hàng
            </Button>,
            <Button key="shop" onClick={() => router.push('/san-pham')}>
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item>
            <Link href="/gio-hang">Giỏ hàng</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái */}
        <div className="lg:col-span-8 space-y-6">
          <ShippingAddressSelection
            shippingAddresses={shippingAddresses || []}
            onSelectAddress={handleSelectShippingAddress}
          />

          {/* Warehouse Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Title level={5} className="mb-4">Chọn kho để giao hàng</Title>
            {isWarehousesLoading ? (
              <Spin tip="Đang tải kho..." />
            ) : (
              <Radio.Group onChange={handleWarehouseChange} value={selectedWarehouse} className="w-full">
                <Space direction="vertical" className="w-full" size="middle">
                  {warehouses?.map((warehouse: Warehouse) => (
                    <Radio key={warehouse.id} value={warehouse} className="w-full">
                      <div className="flex flex-col py-2">
                        <div className="font-semibold text-base">{warehouse.name}</div>
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
          </div>

          {/* Shipping Method */}
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

          {/* Payment Method */}
          <PaymentMethodSelection onMethodSelected={setPaymentMethod} />

          {/* Place Order Button */}
          <Button
            type="primary"
            size="large"
            onClick={handlePlaceOrder}
            loading={isCreatingOrder}
            className="w-full"
            disabled={!shippingInfo.name || !paymentMethod || !warehouseId || shippingFee === null}
          >
            Đặt hàng
          </Button>
        </div>

        {/* Cột phải - Order Summary (Đã gộp vào) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
            <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
            
            {/* Order Summary Content */}
            <div>
              {/* Chọn tất cả checkbox */}
              <div className="flex items-center mb-4">
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={isSelectAllDisabled}
                />
                <Text className="ml-2">Chọn tất cả</Text>
                {isSelectAllDisabled && <Text type="secondary" className="ml-2">(Tối đa 10 sản phẩm)</Text>}
              </div>

              {/* Cart Items List */}
              {items.length === 0 ? (
                <Text type="secondary">Giỏ hàng trống.</Text>
              ) : (
                items.map((item) => {
                  const thumbUrl = getImageUrl(item.thumb || '/no-image.png')

                  return (
                    <div key={item.id} className="flex items-start py-3 border-b">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="mr-4"
                      />

                      <div className="w-16 h-16 mr-4 flex-shrink-0">
                        <img
                          src={thumbUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1">
                        <Text strong>{item.productName}</Text>
                        <div className="text-xs text-gray-500 mt-1">
                          {renderAttributes(item.attributes)}
                        </div>
                        <div className="flex items-center text-sm mt-2">
                          <Text>{formatVND(item.priceAtAdd)}</Text>
                          <Text className="ml-2">x {item.quantity}</Text>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Tổng tiền */}
              <div className="py-4 border-t mt-4">
                <div className="flex justify-between py-1">
                  <Text>Tạm tính:</Text>
                  <Text>{formatVND(temporaryTotal)}</Text>
                </div>
                <div className="flex justify-between py-1">
                  <Text>Phí vận chuyển:</Text>
                  <Text>{formatVND(currentShippingFee)}</Text>
                </div>
                <div className="flex justify-between py-2 border-t mt-2">
                  <Text strong>Tổng cộng:</Text>
                  <Text strong type="danger" className="text-lg">
                    {formatVND(finalTotal)}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal VNPay */}
      <Modal
        title="Thanh toán VNPay"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="80%"
      >
        <iframe
          src={paymentUrl}
          width="100%"
          height="600"
          title="VNPay Payment"
        />
      </Modal>
    </div>
  )
}

export default OrderForm