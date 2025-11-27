// components/admin/staff/StaffTable.tsx
'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, MessageOutlined, UserOutlined, ShoppingOutlined, MessageFilled, DollarOutlined, TeamOutlined } from '@ant-design/icons'
import { useUsersWithRole } from '@/hooks/user/useUsersWithRole'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState, useEffect } from 'react'
import ioClient from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

import { getImageUrl } from '@/utils/getImageUrl'
import { useQueryClient } from '@tanstack/react-query'

// Interface cho nhân viên (có thêm roles)
interface StaffUser {
  id: number
  name: string
  email: string
  avatar: string | null
  isActive: boolean
  type_account: string
  tokenAI: number
  role: string
  tenantId: number | null
  createdAt: string
  updatedAt: string
  conversationId: number | null
  stats: {
    totalMessages: number
    totalOrders: number
    totalOrderValue: number
    recentOrdersCount: number
    avgOrderValue: number
  }
  recentOrders: Array<{
    id: number
    totalAmount: number
    status: string
    createdAt: string
  }>
  roles: Array<{
    id: number
    name: string
    description: string
  }>
  hasRole: boolean
}

export default function StaffTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [openAddRole, setOpenAddRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const { currentUser } = useAuth()

  const { data, isLoading, refetch } = useUsersWithRole({ page, limit: 10, search })
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser()
  const queryClient = useQueryClient()

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

    socketInstance.on('message', (msg: any) => {
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

  const handleOpenChat = (user: StaffUser) => {
    if (user?.conversationId) {
      setSelectedUser(user)
      setOpenChat(true)
      setUnreadCounts(prev => ({
        ...prev,
        [user.conversationId!]: 0
      }))
    } else {
      message.warning('Người dùng này chưa có cuộc trò chuyện!')
    }
  }

  const columns: ColumnsType<StaffUser> = [
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
      width: 80,
      align: 'center',
      render: (avatar: string | null) => {
        const imageUrl = getImageUrl(avatar)
        
        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 18, color: '#d9d9d9' }} />
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
      width: 150,
      render: (name: string, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      key: 'roles',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.roles.map(role => (
            <Tag 
              key={role.id} 
              color={role.name === 'Admin shop' ? 'red' : 'blue'}
            >
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Token AI',
      dataIndex: 'tokenAI',
      key: 'tokenAI',
      width: 100,
      align: 'center',
      render: (token: number) => (
        <Badge 
          count={token} 
          showZero 
          color={token > 0 ? '#52c41a' : '#d9d9d9'}
          style={{ fontSize: '12px' }}
        />
      ),
    },
    {
      title: 'Tin nhắn',
      key: 'totalMessages',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={`Tổng: ${record.stats.totalMessages} tin nhắn`}>
          <div className="flex flex-col items-center">
            <MessageFilled style={{ color: '#1890ff', fontSize: '16px' }} />
            <span className="text-xs font-medium mt-1">{record.stats.totalMessages}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Đơn hàng',
      key: 'orders',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={`${record.stats.totalOrders} đơn hàng - ${record.stats.recentOrdersCount} đơn gần nhất`}>
          <div className="flex flex-col items-center">
            <ShoppingOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
            <span className="text-xs font-medium mt-1">{record.stats.totalOrders}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Kích hoạt' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Chat',
      key: 'chat',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const unreadCount = record.conversationId ? (unreadCounts[record.conversationId] || 0) : 0
        
        return (
          <div className="flex justify-center items-center">
            <Tooltip title={unreadCount > 0 ? `${unreadCount} tin nhắn mới` : 'Xem tin nhắn'}>
              <div className="relative inline-block">
                <MessageOutlined
                  style={{ 
                    color: record.conversationId ? '#1890ff' : '#d9d9d9', 
                    cursor: record.conversationId ? 'pointer' : 'not-allowed',
                    fontSize: '18px'
                  }}
                  onClick={() => record.conversationId && handleOpenChat(record)}
                />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1"
                    style={{ fontSize: '9px', lineHeight: '16px' }}
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
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
         
         
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer', fontSize: '16px' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá nhân viên',
                  content: `Bạn có chắc chắn muốn xoá nhân viên "${record.name}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteUser(record.id)
                      message.success('Xoá nhân viên thành công')
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

  // Không cần ép kiểu vì data từ useUsersWithRole đã có đúng type
  const staffData = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm nhân viên theo tên hoặc email..."
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

      </div>

      <Table
        columns={columns}
        dataSource={staffData}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1300 }}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} nhân viên`,
        }}
      />

   
    </div>
  )
}