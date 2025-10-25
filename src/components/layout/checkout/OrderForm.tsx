'use client'

import React, { useState, useEffect } from 'react'
import { Typography, Button, Spin, message, Breadcrumb, Modal, Result, Radio } from 'antd'
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

const { Title } = Typography


const OrderForm = () => {
  const router = useRouter()
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null)
  const { data: cart, isLoading } = useMyCart()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutate: removeCartItem } = useRemoveCartItem()
  const [warehouseId, setWarehouseId] = useState(0)
  const [pickInfo, setPickInfo] = useState({
    address: "",
    district_id: null,   // Đặt null cho các trường ID
    district_name: "",
    name: "",
    note: "",
    phone: "",
    province_id: null,   // Đặt null cho các trường ID
    province_name: "",
    ward_id: null,       // Đặt null cho các trường ID
    ward_name: "",
  })

  const { data: warehouses, isLoading: isWarehousesLoading } = useAllWarehouses()

  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(undefined)
const handleWarehouseChange = (e: any) => {
  const selected = e.target.value;
  setSelectedWarehouse(selected);
  setWarehouseId(selected.id);
  // Lưu thông tin kho vào pickInfo
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



  
  // ✅ Thông tin giao hàng
  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address: '',
    ward_id: undefined,
    district_id: undefined,
    province_id: undefined,
    city_id: undefined,
    ward_name: '',
    district_name: '',
    province_name: '',
    city_name: '',
    note: '',
  })

  // ✅ Lưu phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<any>(null)

  // ✅ Lưu shippingFee và deliveryMethod
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.STANDARD)
  
  // ✅ Modal để hiển thị trang thanh toán VNPay
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  

  if (isLoading) return <Spin tip="Đang tải giỏ hàng..." />

  const cartTotal =
    cart?.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0

  const totalAmount = cartTotal + (shippingFee || 0)

  // ✅ Callback nhận fee và method từ ShippingMethodSelection
  const handleSelectShippingMethod = (methodId: number | null, fee: number | null) => {
    setShippingFee(fee)
    setDeliveryMethod(methodId === 1 ? DeliveryMethod.XTEAM : DeliveryMethod.STANDARD)
  }

  const handleShippingInfoUpdate = (updatedShippingInfo: ShippingAddress) => {
    setShippingInfo(updatedShippingInfo)
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
      return message.warning('Vui lòng nhập thông tin giao hàng.')
    }

    // ✅ Validation thông tin giao hàng
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return message.warning('Vui lòng nhập đầy đủ thông tin giao hàng.')
    }

    // Chuẩn hóa shippingInfo
    const shippingPayload = {
      name: shippingInfo.name,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      ward_id: shippingInfo.ward_id,
      district_id: shippingInfo.district_id,
      province_id: shippingInfo.province_id,
      city_id: shippingInfo.city_id,
      ward_name: shippingInfo.ward_name,
      district_name: shippingInfo.district_name,
      province_name: shippingInfo.province_name,
      city_name: shippingInfo.city_name,
      note: shippingInfo.note,
    }

    const orderItems: OrderItemDto[] = cart.items.map(item => ({
      sku: item.variant.sku,
      productVariantId: item.variant.id,
      quantity: item.quantity,
      unitPrice: item.priceAtAdd,
      warehouseId: Number(warehouseId)
    }))

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
          const paymentUrl = `http://localhost:4000/api/payments/vnpay?orderId=${orderId}&amount=${totalAmount}&returnUrl=http://localhost:4000/api/payments/vnpay/callback`;

          try {
            const paymentResponse = await axios.get(paymentUrl, {
              headers: {
                'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
              },
            });

            if (paymentResponse?.data?.url) {
              window.open(paymentResponse.data.url, '_blank');
            } else {
              message.error('Không nhận được đường dẫn thanh toán từ VNPay!');
            }
          } catch (error) {
            message.error('Không thể tạo link thanh toán VNPay!');
          }
        } else {
          // ✅ Nếu không phải VNPay (COD, chuyển khoản,...) -> Hiển thị thành công
          setCompletedOrderId(orderId)
          setOrderCompleted(true)
        }
      },
      onError: (error) => {
        message.error('Đặt hàng thất bại!')
      },
    })
  }



  // // Lắng nghe query parameters từ VNPay callback
  // useEffect(() => {
  //   const queryParams = new URLSearchParams(window.location.search)
    
  //   const vnp_ResponseCode = queryParams.get('vnp_ResponseCode')
  //   const vnp_Amount = queryParams.get('vnp_Amount')
  //   const vnp_TxnRef = queryParams.get('vnp_TxnRef')
    
  //   if (vnp_ResponseCode) {
  //     const isValid = vnp_ResponseCode === '00'

  //     handlePaymentCallback({
  //       success: isValid,
  //       message: isValid ? 'Thanh toán thành công' : 'Thanh toán thất bại',
  //       data: {
  //         isValid,
  //         orderId: vnp_TxnRef,
  //         amount: parseInt(vnp_Amount || '0', 10),
  //         responseCode: vnp_ResponseCode,
  //         transactionNo: vnp_TxnRef,
  //         bankCode: queryParams.get('vnp_BankCode'),
  //         payDate: queryParams.get('vnp_PayDate'),
  //       },
  //     })
  //   }
  // }, [])

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
    <div>
      <div className="mb-4">
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item>
            <Link href="/gio-hang">Giỏ hàng</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ✅ Cột trái */}
        <div className="md:col-span-8 space-y-4 bg-white p-6 rounded-xl shadow-sm">
          <ShippingInformation
            shippingInfo={shippingInfo}
            setShippingInfo={setShippingInfo}
            onShippingInfoUpdate={handleShippingInfoUpdate}
          />
            {/* Warehouse Selection */}
          <div className="mb-4">
            <Title level={5}>Chọn kho để giao hàng</Title>
            {isWarehousesLoading ? (
              <Spin tip="Đang tải kho..." />
            ) : (
              <Radio.Group onChange={handleWarehouseChange} value={selectedWarehouse}>
                {warehouses?.map((warehouse: Warehouse) => (
                  <Radio key={warehouse.id} value={warehouse}>
                    {warehouse.name}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </div>

          <ShippingMethodSelection
            onMethodSelected={handleSelectShippingMethod}
            deliveryProvince={shippingInfo.province_name || ''}
            deliveryDistrict={shippingInfo.district_name || ''}
            deliveryWard={shippingInfo.ward_name || null}
            deliveryAddress={shippingInfo.address || null}
            totalWeight={cart?.items.reduce((sum, item) => sum + item.variant.product.weight * item.quantity, 0) || 0}
            totalValue={cartTotal}
            pickProvince={pickInfo.province_name || ''}
            pickDistrict={pickInfo.district_name || ''}
            pickWard={pickInfo.ward_name || null}
            pickAddress={pickInfo.address || ''}
          />

          <PaymentMethodSelection onMethodSelected={setPaymentMethod} />

          <Button
            type="primary"
            size="large"
            onClick={handlePlaceOrder}
            loading={isCreatingOrder}
            className="w-full"
          >
            Đặt hàng
          </Button>
        </div>

        {/* ✅ Cột phải */}
        <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-sm">
          <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
          <OrderSummary />

          {shippingFee !== null && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <Typography.Text>Phí vận chuyển:</Typography.Text>
                <Typography.Text strong>
                  {shippingFee.toLocaleString('vi-VN')} VNĐ
                </Typography.Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Typography.Text>Phương thức:</Typography.Text>
                <Typography.Text strong>
                  {deliveryMethod === DeliveryMethod.XTEAM ? 'Giao hàng nhanh' : 'Giao hàng tiết kiệm'}
                </Typography.Text>
              </div>
              <div className="flex justify-between items-center">
                <Typography.Text strong>Tổng cộng:</Typography.Text>
                <Typography.Text strong className="text-lg text-red-500">
                  {totalAmount.toLocaleString('vi-VN')} VNĐ
                </Typography.Text>
              </div>
            </div>
          )}
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