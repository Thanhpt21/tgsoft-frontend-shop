'use client'

import BrandTable from '@/components/admin/brand/BrandTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminBrandPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách thương hiệu</Title>
      <BrandTable />
    </div>
  )
}
