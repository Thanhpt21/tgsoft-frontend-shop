'use client'

import PermissionTable from '@/components/admin/permission/PermissionTable'
import { Typography } from 'antd'


const { Title } = Typography

export default function AdminPermissionPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý quyền</Title>
      <PermissionTable />
    </div>
  )
}