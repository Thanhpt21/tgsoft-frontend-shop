'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useRoles } from '@/hooks/role/useRoles'
import { useDeleteRole } from '@/hooks/role/useDeleteRole'
import type { Role } from '@/types/role.type'
import { RoleCreateModal } from './RoleCreateModal'
import { RoleUpdateModal } from './RoleUpdateModal'
import { KeyOutlined } from '@ant-design/icons'
import { RolePermissionsModal } from './RolePermissionsModal'

export default function RoleTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [openPermissions, setOpenPermissions] = useState(false)

  const { data, isLoading, refetch } = useRoles({ page, limit: 10, search })
  const { mutateAsync: deleteRole } = useDeleteRole()

  const columns: ColumnsType<Role> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        const color = name === 'admin' ? 'red' : name === 'manager' ? 'blue' : 'green'
        return <Tag color={color}>{name}</Tag>
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
        <Tooltip title="Quản lý quyền">
            <KeyOutlined
            style={{ color: '#52c41a', cursor: 'pointer' }}
            onClick={() => {
                setSelectedRole(record)
                setOpenPermissions(true)
            }}
            />
        </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedRole(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa vai trò',
                  content: `Bạn có chắc chắn muốn xóa vai trò "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteRole(record.id)
                      message.success('Xóa vai trò thành công')
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên vai trò..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} vai trò`,
        }}
      />

      <RoleCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <RoleUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        role={selectedRole}
        refetch={refetch}
      />

      <RolePermissionsModal
        open={openPermissions}
        onClose={() => setOpenPermissions(false)}
        roleId={selectedRole?.id || 0}
        roleName={selectedRole?.name || ''}
        />
    </div>
  )
}