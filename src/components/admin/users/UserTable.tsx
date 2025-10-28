'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, MessageOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/user/useUsers'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState } from 'react'
import { UserCreateModal } from './UserCreateModal'
import { UserUpdateModal } from './UserUpdateModal'
import { UserChatModal } from './UserChatModal' // 🔥 NEW

import type { User } from '@/types/user.type'
import { getImageUrl } from '@/utils/getImageUrl'

export default function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openChat, setOpenChat] = useState(false) // 🔥 NEW
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
            alt="User Avatar"
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
    // 🔥 NEW: Chat Column
  {
      title: 'Tin nhắn',
      key: 'chat',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem tin nhắn">
          <Badge dot={false}> {/* Có thể thêm dot nếu có unread messages */} 
            <MessageOutlined
              style={{ 
                color: '#1890ff', 
                cursor: 'pointer' 
              }}
              onClick={() => {
                if (record?.conversationId) {
                  setSelectedUser(record)
                  setOpenChat(true)
                } else {
                  message.error('Người dùng này chưa có cuộc trò chuyện!')
                }
              }}
            />
          </Badge>
        </Tooltip>
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

      {/* Modals */}
      <UserCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <UserUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        user={selectedUser}
        refetch={refetch}
      />

      {/* 🔥 NEW: Chat Modal */}
      <UserChatModal
        open={openChat}
        onClose={() => {
          setOpenChat(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
         conversationId={selectedUser?.conversationId ?? null}
      />
    </div>
  )
}