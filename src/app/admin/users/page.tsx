'use client'

import { Typography } from 'antd'
import UserTable from '@/components/admin/users/UserTable'

const { Title } = Typography

export default function AdminUserPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách người dùng</Title>
      <UserTable />
    </div>
  )
}
