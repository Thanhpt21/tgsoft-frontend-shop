'use client'

import SizeTable from '@/components/admin/size/SizeTable'
import { Typography } from 'antd'

const { Title } = Typography


export default function AdminSizePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách màu sắc</Title>
      <SizeTable />
    </div>
  )
}
