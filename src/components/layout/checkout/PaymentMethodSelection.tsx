'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePaymentMethods } from '@/hooks/payment-method/usePaymentMethods'
import { PaymentMethod } from '@/types/payment-method.type'

interface PaymentMethodSelectionProps {
  onMethodSelected: (method: PaymentMethod) => void
}

// Nội dung chi tiết - Không border
const CodContent = () => (
  <div className="mt-4 p-5 bg-gray-50 rounded-xl">
    <h4 className="font-bold text-gray-800 mb-3">Thanh toán khi nhận hàng (COD)</h4>
    <p className="text-gray-600 text-sm leading-relaxed">
      Thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản cho nhân viên giao hàng khi nhận sản phẩm. 
      An toàn và tiện lợi, không cần thẻ ngân hàng.
    </p>
    <div className="mt-4 text-sm text-gray-500">
      • Không tính phí thanh toán
    </div>
  </div>
)

const BankTransferContent = () => (
  <div className="mt-4 p-5 bg-blue-50 rounded-xl">
    <h4 className="font-bold text-gray-800 mb-3">Chuyển khoản ngân hàng</h4>
    <p className="text-gray-600 text-sm mb-4">
      Chuyển khoản trước khi đơn hàng được xử lý. Đơn hàng sẽ được giao sau khi xác nhận thanh toán.
    </p>
    <div className="p-4 bg-white rounded-lg">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Ngân hàng</span>
          <span className="font-semibold">Vietcombank</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Số tài khoản</span>
          <span className="font-mono font-semibold">0011 0023 4567</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Chủ tài khoản</span>
          <span className="font-semibold">CÔNG TY TNHH ABC</span>
        </div>
        <div className="pt-3 mt-3 border-t border-gray-200 text-xs text-gray-500">
          <strong>Nội dung chuyển khoản:</strong> [Mã đơn hàng] - [Số điện thoại]
        </div>
      </div>
    </div>
  </div>
)

const VnpayContent = () => (
  <div className="mt-4 p-5 bg-orange-50 rounded-xl">
    <h4 className="font-bold text-gray-800 mb-3">Thanh toán qua VNPay</h4>
    <p className="text-gray-600 text-sm mb-4">
      Thanh toán an toàn qua cổng VNPay với đa dạng phương thức: Thẻ ngân hàng, Ví điện tử, QR Code.
    </p>
    <div className="p-4 bg-white rounded-lg text-sm">
      <p className="font-medium text-gray-700">Các ngân hàng hỗ trợ</p>
      <p className="text-xs text-gray-500 mt-1">
        Vietcombank, BIDV, Techcombank, Agribank, và hơn 40 ngân hàng khác
      </p>
    </div>
    <div className="mt-4 text-sm text-amber-700">
      Lưu ý: Vui lòng đặt hàng để tiến hành thanh toán VNPay
    </div>
  </div>
)

// Memoized content
const MemoCodContent = React.memo(CodContent)
const MemoBankTransferContent = React.memo(BankTransferContent)
const MemoVnpayContent = React.memo(VnpayContent)

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  onMethodSelected,
}) => {
  const { data: paymentResponse, isLoading } = usePaymentMethods()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const hasSelectedInitial = useRef(false)

  const paymentMethods = useMemo(() => 
    paymentResponse?.data || [], 
    [paymentResponse?.data]
  )

  // Tự động chọn COD làm mặc định
  useEffect(() => {
    if (!hasSelectedInitial.current && paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find((m: any) => m.code === 'COD') || paymentMethods[0]
      if (defaultMethod) {
        setSelectedMethod(defaultMethod)
        onMethodSelected(defaultMethod)
        hasSelectedInitial.current = true
      }
    }
  }, [paymentMethods, onMethodSelected])

  const handleSelectPaymentMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method)
    onMethodSelected(method)
  }, [onMethodSelected])

  const renderSelectedContent = useMemo(() => {
    if (!selectedMethod) return null
    
    switch (selectedMethod.code) {
      case 'COD':
        return <MemoCodContent />
      case 'BANK_TRANSFER':
        return <MemoBankTransferContent />
      case 'VNPAY':
        return <MemoVnpayContent />
      default:
        return null
    }
  }, [selectedMethod])

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Phương thức thanh toán</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (paymentMethods.length === 0) {
    return (
      <div className="bg-white rounded-xl text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Phương thức thanh toán</h3>
        <p className="text-gray-600">Không có phương thức thanh toán khả dụng</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl">


      {/* Danh sách phương thức - Không border */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method: PaymentMethod) => {
          const isSelected = selectedMethod?.id === method.id
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelectPaymentMethod(method)}
              className={`
                w-full p-4 text-left rounded-xl transition-all duration-200 text-sm
                ${isSelected 
                  ? 'bg-blue-50' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{method.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {method.code === 'COD' && 'Thanh toán khi nhận hàng'}
                    {method.code === 'BANK_TRANSFER' && 'Chuyển khoản ngân hàng'}
                    {method.code === 'VNPAY' && 'Thanh toán trực tuyến qua VNPay'}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Chi tiết phương thức đã chọn - Không border phân cách */}
      {selectedMethod && (
        <div className="pt-2">
          <h4 className="font-medium text-gray-700 mb-4">Thông tin chi tiết</h4>
          {renderSelectedContent}
        </div>
      )}
    </div>
  )
}

export default React.memo(PaymentMethodSelection)