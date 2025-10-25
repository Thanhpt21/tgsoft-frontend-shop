'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/user/useUsers'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState } from 'react'
import { UserCreateModal } from './UserCreateModal'
import { UserUpdateModal } from './UserUpdateModal'

import type { User } from '@/types/user.type'
import { getImageUrl } from '@/utils/getImageUrl'

export default function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data, isLoading, refetch } = useUsers({ page, limit: 10, search })
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser()


  const columns: ColumnsType<User> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
       {
      title: 'Hình ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 100,
      align: 'center',
      render: (avatar: string | null) => {
        const imageUrl = getImageUrl(avatar)
        
        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        }

        return (
          <Image
            src={imageUrl}
            alt="Brand"
            width={40}
            height={40}
            className="object-cover rounded"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            preview={false}
          />
        )
      },
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  //   {
  //   title: 'Role',
  //   key: 'roles',
  //   render: (_, record) => {
  //     const tenantRoles = record.userTenantRoles || [];

  //     // Nếu không có role
  //     if (tenantRoles.length === 0) {
  //       return <Tag color="default">Khách hàng</Tag>;
  //     }

  //     // Nếu có nhiều role
  //     return (
  //       <Space size={[4, 4]} wrap>
  //         {tenantRoles.map((r) => (
  //           <Tag
  //             key={r.role.id}
  //             color={
  //               r.role.name === 'admin'
  //                 ? 'volcano'
  //                 : r.role.name === 'manager'
  //                 ? 'blue'
  //                 : 'green'
  //             }
  //           >
  //             {r.role.name}
  //           </Tag>
  //         ))}
  //       </Space>
  //     );
  //   },
  // },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Kích hoạt' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá người dùng',
                  content: `Bạn có chắc chắn muốn xoá người dùng "${record.name}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteUser(record.id)
                      message.success('Xoá người dùng thành công')
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại')
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
        {/* Nhóm trái: Input và nút Tìm kiếm */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
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

        {/* Nhóm phải: Nút Tạo mới */}
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm mới
        </Button>
      </div>

      {/* 📋 Table */}
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
        }}
      />

      <UserCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch} // từ useUsers
      />

      <UserUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        user={selectedUser}
        refetch={refetch}
      />
    </div>
  )
}
