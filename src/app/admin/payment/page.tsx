'use client'

import PaymentTable from '@/components/admin/payment/PaymentTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminPaymentPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách thanh toán</Title>
      <PaymentTable />
    </div>
  )
}
