'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePaymentMethods } from '@/hooks/payment-method/usePaymentMethods'
import { PaymentMethod } from '@/types/payment-method.type'

interface PaymentMethodSelectionProps {
  onMethodSelected: (method: PaymentMethod) => void
}

// Payment method content components
const CodContent = () => (
  <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</h4>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed">
      Thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản cho nhân viên giao hàng khi nhận sản phẩm. 
      An toàn và tiện lợi, không cần thẻ ngân hàng.
    </p>
    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Không tính phí thanh toán</span>
    </div>
  </div>
)

const BankTransferContent = () => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h4 className="font-bold text-gray-800">Chuyển khoản ngân hàng</h4>
    </div>
    <div className="space-y-3">
      <p className="text-gray-600 text-sm">
        Chuyển khoản trước khi đơn hàng được xử lý. Đơn hàng sẽ được giao sau khi xác nhận thanh toán.
      </p>
      <div className="p-3 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ngân hàng:</span>
            <span className="font-semibold">Vietcombank</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số tài khoản:</span>
            <span className="font-mono font-semibold">0011 0023 4567</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chủ tài khoản:</span>
            <span className="font-semibold">CÔNG TY TNHH ABC</span>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Nội dung chuyển khoản:</strong> [Mã đơn hàng] - [Số điện thoại]
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const VnpayContent = () => (
  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h4 className="font-bold text-gray-800">Thanh toán qua VNPay</h4>
    </div>
    <div className="space-y-3">
      <p className="text-gray-600 text-sm">
        Thanh toán an toàn qua cổng VNPay với đa dạng phương thức: Thẻ ngân hàng, Ví điện tử, QR Code.
      </p>
      <div className="p-3 bg-white rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">Các ngân hàng hỗ trợ</p>
            <p className="text-xs text-gray-500 mt-1">Vietcombank, BIDV, Techcombank, Agribank, và 40+ ngân hàng khác</p>
          </div>
          <div className="w-16 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-white">VNPay</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-amber-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Vui lòng đặt hàng để tiến hành thanh toán VNPay</span>
      </div>
    </div>
  </div>
)

// Memoized content components
const MemoCodContent = React.memo(CodContent)
const MemoBankTransferContent = React.memo(BankTransferContent)
const MemoVnpayContent = React.memo(VnpayContent)

// Main component
const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  onMethodSelected,
}) => {
  const { data: paymentResponse, isLoading } = usePaymentMethods()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const hasSelectedInitial = useRef(false)

  // Memoized payment methods
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

  // Memoized handler
  const handleSelectPaymentMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method)
    onMethodSelected(method)
  }, [onMethodSelected])

  // Memoized method options
  const methodOptions = useMemo(() => 
    paymentMethods.map((method: PaymentMethod) => ({
      ...method,
      icon: getMethodIcon(method.code),
      color: getMethodColor(method.code),
      description: getMethodDescription(method.code),
    })), 
    [paymentMethods]
  )

  // Render content based on selected method
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Phương thức thanh toán</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (paymentMethods.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Phương thức thanh toán</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">Không có phương thức thanh toán khả dụng</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Phương thức thanh toán</h3>
      </div>

      {/* Method Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {methodOptions.map((method: any) => {
          const isSelected = selectedMethod?.id === method.id
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelectPaymentMethod(method)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                active:scale-[0.99]
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-lg ${method.color} transition-colors`}>
                  {method.icon}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  {method.description && (
                    <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Method Details */}
      {selectedMethod && (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Chi tiết phương thức thanh toán</span>
          </div>
          
          {renderSelectedContent}
        </div>
      )}
    </div>
  )
}

// Helper functions
const getMethodIcon = (code: string) => {
  switch (code) {
    case 'COD':
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    case 'BANK_TRANSFER':
      return (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'VNPAY':
      return (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    default:
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
  }
}

const getMethodColor = (code: string): string => {
  switch (code) {
    case 'COD': return 'bg-green-100'
    case 'BANK_TRANSFER': return 'bg-blue-100'
    case 'VNPAY': return 'bg-orange-100'
    default: return 'bg-gray-100'
  }
}

const getMethodDescription = (code: string): string => {
  switch (code) {
    case 'COD': return 'Thanh toán khi nhận hàng'
    case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng'
    case 'VNPAY': return 'Thanh toán trực tuyến'
    default: return 'Phương thức thanh toán'
  }
}

export default React.memo(PaymentMethodSelection, (prevProps, nextProps) => {
  // Chỉ re-render khi callback thay đổi
  return prevProps.onMethodSelected === nextProps.onMethodSelected
})