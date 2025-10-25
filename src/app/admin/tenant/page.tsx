'use client'

import TenantTable from '@/components/admin/tenant/TenantTable'
import { Typography } from 'antd'


const { Title } = Typography

export default function AdminTenantPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý cửa hàng</Title>
      <TenantTable />
    </div>
  )
}