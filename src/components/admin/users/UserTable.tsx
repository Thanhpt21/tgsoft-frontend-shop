'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message, Badge, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/user/useUsers'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState, useEffect } from 'react'
import { UserCreateModal } from './UserCreateModal'
import { UserUpdateModal } from './UserUpdateModal'
import { UserChatModal } from './UserChatModal'
import { AddRoleModal } from './AddRoleModal'
import ioClient from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'


import type { User } from '@/types/user.type'
import { getImageUrl } from '@/utils/getImageUrl'
import { useGetAiChatEnabled } from '@/hooks/chat/useGetAiChatEnabled'
import { useToggleAiChat } from '@/hooks/chat/useToggleAiChat'
import { useQueryClient } from '@tanstack/react-query'


export default function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [openAddRole, setOpenAddRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({}) // conversationId -> count
  const { currentUser } = useAuth()

  const { data, isLoading, refetch } = useUsers({ page, limit: 10, search })
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser()
  const queryClient = useQueryClient()
  const { 
    data: aiChatEnabled = false, 
    isLoading: isLoadingAiStatus 
  } = useGetAiChatEnabled()
  const { mutate: toggleAiChat, isPending: isToggling } = useToggleAiChat()

  // Socket để lắng nghe tin nhắn mới
  useEffect(() => {
    if (!currentUser?.id) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL
    const socketInstance = ioClient(`${WS_URL}/chat`, {
      auth: {
        userId: currentUser?.id,
        isAdmin: true,
        tenantId: parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1', 10),
      },
      transports: ['websocket'],
      reconnection: true,
    })

    socketInstance.on('connect', () => {
      socketInstance.emit('admin-login', { adminId: currentUser?.id })
    })

    // Lắng nghe tin nhắn mới từ user
    socketInstance.on('message', (msg: any) => {
      
      // Chỉ đếm tin nhắn từ USER hoặc GUEST (không phải ADMIN/BOT)
      if ((msg.senderType === 'USER' || msg.senderType === 'GUEST') && msg.conversationId) {
        setUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [msg.conversationId]: (prev[msg.conversationId] || 0) + 1
          }
          return newCounts
        })
      }
    })

    // Lắng nghe event new-user-message (nếu server emit event này)
    socketInstance.on('new-user-message', (data: any) => {
      if (data.conversationId) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] || 0) + 1
        }))
      }
    })

    socketInstance.on('disconnect', () => {
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [currentUser?.id])

  // Reset unread count khi mở chat
  const handleOpenChat = (user: User) => {
    if (user?.conversationId) {
      setSelectedUser(user)
      setOpenChat(true)
      // Reset count khi mở chat
      setUnreadCounts(prev => ({
        ...prev,
        [user.conversationId!]: 0
      }))
    } else {
      message.warning('Người dùng này chưa có cuộc trò chuyện!')
    }
  }

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
    {
      title: 'Tin nhắn',
      key: 'chat',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const unreadCount = record.conversationId ? (unreadCounts[record.conversationId] || 0) : 0
        
        return (
          <div className="flex justify-center items-center">
            <Tooltip title={unreadCount > 0 ? `${unreadCount} tin nhắn mới` : 'Xem tin nhắn'}>
              <div className="relative inline-block">
                <MessageOutlined
                  style={{ 
                    color: '#1890ff', 
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                  onClick={() => handleOpenChat(record)}
                />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    style={{ fontSize: '10px' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </Tooltip>
          </div>
        )
      },
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
          <Tooltip title="Quản lý quyền">
            <UserOutlined
              style={{ color: '#faad14', cursor: 'pointer' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenAddRole(true)
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

  const handleToggleAi = () => {
      toggleAiChat(
        undefined, // không cần truyền gì
        {
          onSuccess: () => {
            message.success(`AI Chat đã ${!aiChatEnabled ? 'bật' : 'tắt'}`)
          },
          onError: () => {
            message.error('Cập nhật thất bại')
          },
        }
      )
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
       <div className="flex items-center gap-4">
         <Switch
              checked={aiChatEnabled}
              loading={isLoadingAiStatus || isToggling}
              onChange={handleToggleAi}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          
          <Button type="primary" onClick={() => setOpenCreate(true)}>
            Thêm mới
          </Button>
        </div>
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

      {/* Add Role Modal */}
      <AddRoleModal
        open={openAddRole}
        onClose={() => {
          setOpenAddRole(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* Chat Modal */}
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