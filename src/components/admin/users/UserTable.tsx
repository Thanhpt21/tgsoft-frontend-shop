'use client'

import { Table, Tag, Image, Space, Tooltip, Input, Button, Modal, message, Badge, Switch, Dropdown } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, MessageOutlined, UserOutlined, ShoppingOutlined, MessageFilled, DollarOutlined, TagOutlined, TeamOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/user/useUsers'
import { useDeleteUser } from '@/hooks/user/useDeleteUser'
import { useState, useEffect } from 'react'
import { UserCreateModal } from './UserCreateModal'
import { UserUpdateModal } from './UserUpdateModal'
import { UserChatModal } from './UserChatModal'
import { AddRoleModal } from './AddRoleModal'
import { LeadsModal } from './LeadsModal'
import ioClient from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

import type { User } from '@/types/user.type'
import { getImageUrl } from '@/utils/getImageUrl'
import { useGetAiChatEnabled } from '@/hooks/chat/useGetAiChatEnabled'
import { useToggleAiChat } from '@/hooks/chat/useToggleAiChat'
import { useQueryClient } from '@tanstack/react-query'
import { useToggleUserChat } from '@/hooks/user/useToggleUserChat'
import { useUpdateUserTag } from '@/hooks/user/useUpdateUserTag'
import { UserTag } from '@/enums/user.enums'


// Config tags với màu sắc
const USER_TAGS_CONFIG = {
  [UserTag.POTENTIAL]: { label: 'Tiềm năng', color: 'green' },
  [UserTag.VIP]: { label: 'VIP', color: 'purple' },
  [UserTag.SPAM]: { label: 'Spam', color: 'red' },
  [UserTag.NEW_CUSTOMER]: { label: 'Khách mới', color: 'cyan' },
  [UserTag.NEED_CARE]: { label: 'Cần quan tâm', color: 'orange' },
} as const;

// Định nghĩa interface mở rộng ngay trong component
interface UserWithStats extends User {
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
}

export default function UserTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [openAddRole, setOpenAddRole] = useState(false)
  const [openLeads, setOpenLeads] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const { currentUser } = useAuth()

  const { data, isLoading, refetch } = useUsers({ page, limit: 10, search })
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: toggleUserChat, isPending: isTogglingChat } = useToggleUserChat()
  const { mutate: updateUserTag, isPending: isUpdatingTag } = useUpdateUserTag()
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

  const handleOpenChat = (user: UserWithStats) => {
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

  const handleToggleUserChat = (userId: number, enabled: boolean, userName: string) => {
    toggleUserChat(
      { userId, enabled },
      {
        onSuccess: () => {
          message.success(`Đã ${enabled ? 'bật' : 'tắt'} chat cho ${userName}`)
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || 'Cập nhật thất bại')
        }
      }
    )
  }

  const handleUpdateUserTag = (userId: number, tag: UserTag | null, userName: string) => {
    updateUserTag(
      { userId, tag },
      {
        onSuccess: () => {
          const action = tag ? `gán tag "${USER_TAGS_CONFIG[tag]?.label}"` : 'xóa tag'
          message.success(`Đã ${action} cho ${userName}`)
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || 'Cập nhật tag thất bại')
        }
      }
    )
  }

  const columns: ColumnsType<UserWithStats> = [
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
      title: 'Tag',
      key: 'tag',
      width: 120,
      render: (_, record) => {
        const currentTag = record.tag ? USER_TAGS_CONFIG[record.tag] : null
        
        return (
          <Dropdown
            menu={{
              items: [
                ...Object.entries(USER_TAGS_CONFIG).map(([value, config]) => ({
                  key: value,
                  label: config.label,
                  onClick: () => handleUpdateUserTag(record.id, value as UserTag, record.name)
                })),
                {
                  key: 'remove',
                  label: 'Xóa tag',
                  onClick: () => handleUpdateUserTag(record.id, null, record.name)
                }
              ]
            }}
            trigger={['click']}
          >
            <div className="cursor-pointer">
              {currentTag ? (
                <Tag color={currentTag.color} className="cursor-pointer">
                  {currentTag.label}
                </Tag>
              ) : (
                <Tag color="default" icon={<TagOutlined />} className="cursor-pointer">
                  Gán tag
                </Tag>
              )}
            </div>
          </Dropdown>
        )
      },
    },
    {
      title: 'Bật/Tắt Chat',
      key: 'chatEnabled',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.chatEnabled ? 'Đang bật chat' : 'Đã tắt chat'}>
          <Switch
            checked={record.chatEnabled}
            loading={isTogglingChat}
            onChange={(checked) => handleToggleUserChat(record.id, checked, record.name)}
            size="small"
          />
        </Tooltip>
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
      title: 'Tổng chi tiêu',
      key: 'totalOrderValue',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={`Tổng giá trị ${record.stats.recentOrdersCount} đơn gần nhất`}>
          <div className="flex flex-col items-center">
            <DollarOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            <span className="text-xs font-medium mt-1">
              {(record.stats.totalOrderValue / 1000).toFixed(0)}K
            </span>
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
                    color: record.conversationId && record.chatEnabled ? '#1890ff' : '#d9d9d9', 
                    cursor: record.conversationId && record.chatEnabled ? 'pointer' : 'not-allowed',
                    fontSize: '18px'
                  }}
                  onClick={() => record.conversationId && record.chatEnabled && handleOpenChat(record)}
                />
                {unreadCount > 0 && record.chatEnabled && (
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
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer', fontSize: '16px' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Quản lý quyền">
            <UserOutlined
              style={{ color: '#faad14', cursor: 'pointer', fontSize: '16px' }}
              onClick={() => {
                setSelectedUser(record)
                setOpenAddRole(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer', fontSize: '16px' }}
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
    toggleAiChat(undefined, {
      onSuccess: () => {
        message.success(`AI Chat đã ${!aiChatEnabled ? 'bật' : 'tắt'}`)
      },
      onError: () => {
        message.error('Cập nhật thất bại')
      },
    })
  }

  // Ép kiểu data sang UserWithStats
  const userData = (data?.data as unknown as UserWithStats[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">AI Chat:</span>
            <Switch
              checked={aiChatEnabled}
              loading={isLoadingAiStatus || isToggling}
              onChange={handleToggleAi}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          </div>
          <Button 
            type="default" 
            icon={<TeamOutlined />}
            onClick={() => setOpenLeads(true)}
          >
            Khách hàng AI Bot
          </Button>
          <Button type="primary" onClick={() => setOpenCreate(true)}>
            Thêm mới
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={userData} 
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1400 }}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} người dùng`,
        }}
      />

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

      <AddRoleModal
        open={openAddRole}
        onClose={() => {
          setOpenAddRole(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      <UserChatModal
        open={openChat}
        onClose={() => {
          setOpenChat(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        conversationId={selectedUser?.conversationId ?? null}
      />

      <LeadsModal
        open={openLeads}
        onClose={() => setOpenLeads(false)}
      />
    </div>
  )
}