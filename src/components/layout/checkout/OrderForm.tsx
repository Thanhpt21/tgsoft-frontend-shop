'use client'

import React, { useEffect, useState } from 'react'
import { Typography, Button, Spin, message, Breadcrumb, Modal, Result, Radio, Space } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useMyCart } from '@/hooks/cart/useMyCart'
import { useCreateOrder } from '@/hooks/order/useCreateOrder'
import { CreateOrderDto, OrderItemDto } from '@/types/order.type'
import { ShippingAddress } from '@/types/shipping-address.type'
import OrderSummary from './OrderSummary'
import PaymentMethodSelection from './PaymentMethodSelection'
import ShippingInformation from './ShippingInformation'
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

const { Title } = Typography

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

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const handleSelectedItemsChange = (newSelectedItems: Set<number>) => {
    setSelectedItems(newSelectedItems);
  };

  // Tính tổng trọng lượng của các sản phẩm được chọn
  const totalWeight = cart?.items.reduce((sum, item) => {
    if (selectedItems.has(item.id)) {
      return sum + item.variant.product.weight * item.quantity;
    }
    return sum;
  }, 0) || 0;

  // Tính tổng giá trị của các sản phẩm được chọn
  const totalValue = cart?.items.filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0;

    // ✅ Tự động chọn địa chỉ mặc định khi trang được render
  useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0) {
      const defaultAddress = shippingAddresses.find((address: ShippingAddress) => address.is_default)
      if (defaultAddress) {
        setShippingInfo(defaultAddress)
      }
    }
  }, [shippingAddresses])
  
  const handleWarehouseChange = (e: any) => {
    const selected = e.target.value;
    setSelectedWarehouse(selected);
    setWarehouseId(selected.id);
    
    if (selected && selected.location) {
      const location = selected.location;
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
      });
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
  });


  // ✅ Lưu phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<any>(null)

  // ✅ Lưu shippingFee và deliveryMethod
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.STANDARD)
  
  // ✅ Modal để hiển thị trang thanh toán VNPay
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')

  if (isLoading) return <Spin tip="Đang tải giỏ hàng..." className="flex justify-center items-center min-h-screen" />


  // ✅ Callback nhận fee và method từ ShippingMethodSelection
  const handleSelectShippingMethod = (methodId: number | null, fee: number | null) => {
    setShippingFee(fee)
    setDeliveryMethod(methodId === 1 ? DeliveryMethod.XTEAM : DeliveryMethod.STANDARD)
  }

  const handleSelectShippingAddress = (selectedAddress: ShippingAddress) => {
    setShippingInfo(selectedAddress); // Cập nhật thông tin giao hàng khi chọn địa chỉ
  }

  const handlePlaceOrder = () => {
    // ✅ Validation
    if (!cart?.items?.length) {
      return message.warning('Giỏ hàng trống.')
    }

    if (!paymentMethod) {
      return message.warning('Vui lòng chọn phương thức thanh toán.')
    }

    if (shippingFee === null || shippingFee === undefined) {
      return message.warning('Vui lòng chọn phương thức vận chuyển.')
    }

    // ✅ Validation thông tin giao hàng
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return message.warning('Vui lòng chọn địa chỉ giao hàng.')
    }

    if (!warehouseId) {
      return message.warning('Vui lòng chọn kho để giao hàng.')
    }

    // Chuẩn hóa shippingInfo
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
      .filter(item => selectedItems.has(item.id)) // Filter selected items
      .map(item => ({
        sku: item.variant.sku,
        productVariantId: item.variant.id,
        quantity: item.quantity,
        unitPrice: item.priceAtAdd,
        warehouseId: Number(warehouseId)
      }));
    const totalAmount = orderItems.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity + shippingFee!;
    }, 0);

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

    console.log('Order Payload:', payload);

    createOrder(payload, {
      onSuccess: async (response) => {
        const orderId = response.id;
        const totalAmount = response.totalAmount
        message.success('Đặt hàng thành công!')

        cart.items.forEach(item => {
          removeCartItem(item.id)
        })

        // ✅ Nếu thanh toán qua VNPay
        if (paymentMethod.code === 'VNPAY') {
          const paymentUrl = `https://api.aiban.vn/payments/vnpay?orderId=${orderId}&amount=${totalAmount}&returnUrl=https://api.aiban.vn/payments/vnpay/callback`;

          try {
            const paymentResponse = await axios.get(paymentUrl, {
              headers: {
                'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
              },
            });

            if (paymentResponse?.data?.url) {
              window.location.href = paymentResponse.data.url;
            } else {
              message.error('Không nhận được đường dẫn thanh toán từ VNPay!');
            }
          } catch (error) {
            message.error('Không thể tạo link thanh toán VNPay!');
          }
        } else {
          setCompletedOrderId(orderId);
          setOrderCompleted(true);
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

  // ✅ Màn hình đặt hàng thành công (không phải VNPay)
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
        {/* ✅ Cột trái */}
        <div className="lg:col-span-8 space-y-6">
          {/* ✅ Component hiển thị danh sách địa chỉ đã lưu */}
          <ShippingAddressSelection
            shippingAddresses={shippingAddresses || []}
            onSelectAddress={handleSelectShippingAddress} // Cập nhật địa chỉ khi chọn
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

        {/* ✅ Cột phải - Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
            <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
            <OrderSummary onSelectedItemsChange={handleSelectedItemsChange} />
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