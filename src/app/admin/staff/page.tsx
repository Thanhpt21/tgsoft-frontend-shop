// app/admin/staff/page.tsx
'use client'

import { Typography } from 'antd'
import StaffTable from '@/components/admin/staff/StaffTable'

const { Title } = Typography

export default function AdminStaffPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách nhân viên</Title>
      <StaffTable />
    </div>
  )
}