'use client'

import React, { useState, useEffect } from 'react'
import { Button, Typography, Spin, Empty } from 'antd'
import { usePaymentMethods } from '@/hooks/payment-method/usePaymentMethods'
import { PaymentMethod, PaymentMethod as PaymentMethodType } from '@/types/payment-method.type'

const { Title, Paragraph } = Typography

interface PaymentMethodSelectionProps {
  onMethodSelected: (method: PaymentMethodType) => void
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  onMethodSelected,
}) => {
  const { data: paymentResponse, isLoading } = usePaymentMethods()
  const paymentMethods = paymentResponse?.data || []
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)

  // chọn mặc định COD nếu có
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultMethod =
        paymentMethods.find((m: PaymentMethod) => m.code === 'COD') || paymentMethods[0]
      setSelectedMethod(defaultMethod)
      onMethodSelected(defaultMethod)
    }
  }, [paymentMethods, onMethodSelected])

  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method)
    onMethodSelected(method)
  }

  const renderPaymentMethodContent = (code: string) => {
    switch (code) {
      case 'COD':
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5}>Thanh toán khi nhận hàng (COD)</Title>
            <Paragraph>
              Bạn có thể thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản cho nhân viên giao hàng khi nhận được sản phẩm.
            </Paragraph>
          </div>
        )
      case 'BANK_TRANSFER':
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5}>Chuyển khoản ngân hàng</Title>
            <div className="bg-white p-3 rounded-md border border-dashed border-gray-300 text-sm">
              <p><strong>Ngân hàng:</strong> Vietcombank</p>
              <p><strong>Số tài khoản:</strong> 0011002345678</p>
              <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH ABC</p>
              <p><strong>Nội dung:</strong> [Mã đơn hàng] - [Số điện thoại]</p>
            </div>
          </div>
        )
      case 'VNPAY':
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5}>Thanh toán qua VNPay</Title>
            <Paragraph>Vui lòng đặt hàng để tiến hành thanh toán</Paragraph>
    
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) return <Spin tip="Đang tải phương thức thanh toán..." />
  if (!paymentMethods.length)
    return <Empty description="Không có phương thức thanh toán khả dụng" />

  return (
    <div>
      <Title level={4}>Phương thức thanh toán</Title>
      <div className="mb-4 flex flex-wrap gap-2">
        {paymentMethods.map((method: PaymentMethod) => (
          <Button
            key={method.id}
            type={selectedMethod?.id === method.id ? 'primary' : 'default'}
            onClick={() => handleSelectPaymentMethod(method)}
          >
            {method.name}
          </Button>
        ))}
      </div>

      {selectedMethod && renderPaymentMethodContent(selectedMethod.code)}
    </div>
  )
}

export default PaymentMethodSelection
