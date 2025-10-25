'use client'

import RoleTable from '@/components/admin/role/RoleTable'
import { Typography } from 'antd'


const { Title } = Typography

export default function AdminRolePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý vai trò</Title>
      <RoleTable />
    </div>
  )
}