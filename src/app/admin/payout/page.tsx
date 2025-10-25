'use client'

import PayoutTable from '@/components/admin/payout/PayoutTable'
import { Typography } from 'antd'


const { Title } = Typography

export default function AdminPayoutPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">
        Danh sách phiếu chi
      </Title>
      <PayoutTable />
    </div>
  )
}
