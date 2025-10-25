'use client'

import WarehouseTable from '@/components/admin/warehouse/WarehouseTable'
import { Typography } from 'antd'


const { Title } = Typography

export default function AdminWarehousePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách Nhà kho</Title>
      <WarehouseTable />
    </div>
  )
}