'use client'

import React from 'react'
import { Modal, Typography, Descriptions, Spin } from 'antd'
import { Payment } from '@/types/payment.type'
import { usePaymentByOrderId } from '@/hooks/payment/usePaymentByOrderId'  // Import hook usePaymentByOrderId

const { Title } = Typography

type PaymentDetailModalProps = {
  open: boolean
  onClose: () => void
  orderId?: number
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  open,
  onClose,
  orderId,
}) => {
  // Sử dụng hook để lấy dữ liệu thanh toán
  const { data: paymentData, isLoading, isError } = usePaymentByOrderId(orderId as number)

  // Nếu không có dữ liệu hoặc có lỗi khi lấy dữ liệu
  if (isError) {
    return (
      <Modal
        visible={open}
        title="Chi tiết thanh toán"
        onCancel={onClose}
        onOk={onClose}
        width={600}
        footer={null}
      >
        <div>Đã có lỗi khi tải thông tin thanh toán!</div>
      </Modal>
    )
  }

  return (
    <Modal
      visible={open}
      title="Chi tiết thanh toán"
      onCancel={onClose}
      onOk={onClose}
      width={600}
      footer={null}
    >
      {isLoading ? (
        <Spin />
      ) : (
        paymentData && (
          <div>
            <Title level={4}>Thông tin thanh toán</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Phương thức thanh toán">
                {paymentData[0]?.method?.name || 'N/A'} {/* Assuming data returns an array */}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {paymentData[0]?.providerData?.payDate
                  ? new Date(paymentData[0].providerData.payDate).toLocaleString('vi-VN')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã ngân hàng">
                {paymentData[0]?.providerData?.bankCode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch">
                {paymentData[0]?.transactionId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span
                  style={{
                    color:
                      paymentData[0]?.status === 'SUCCESS'
                        ? 'green'
                        : paymentData[0]?.status === 'FAILED'
                        ? 'red'
                        : 'orange',
                  }}
                >
                  {paymentData[0]?.status || 'N/A'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                {paymentData[0]?.amount
                  ? paymentData[0].amount.toLocaleString() + ' ' + paymentData[0]?.currency
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )
      )}
    </Modal>
  )
}

export default PaymentDetailModal
