'use client'

import SupportMailboxTable from '@/components/admin/support-mailbox/SupportMailboxTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminSupportMailboxPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách yêu cầu hỗ trợ kỹ thuật</Title>
      <SupportMailboxTable />
    </div>
  )
}