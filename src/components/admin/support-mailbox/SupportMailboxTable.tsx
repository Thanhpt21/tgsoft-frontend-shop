'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Image, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { SupportMailbox } from '@/types/support-mailbox.types'
import { useSupportMailboxes } from '@/hooks/support-mailbox/useSupportMailboxes'
import { useDeleteSupportMailbox } from '@/hooks/support-mailbox/useDeleteSupportMailbox'
import { SupportMailboxCreateModal } from './SupportMailboxCreateModal'
import { SupportMailboxUpdateModal } from './SupportMailboxUpdateModal'
import { SupportMailboxAdminReplyModal } from './SupportMailboxAdminReplyModal'
import { SupportMailboxDetailModal } from './SupportMailboxDetailModal' // ✅ Thêm import
import { getStatusColor, getStatusLabel } from './support-mailbox.utils'
import { SupportStatus } from '@/enums/support-mailbox.enums'

const { Search } = Input

export default function SupportMailboxTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SupportStatus | ''>('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openAdminReply, setOpenAdminReply] = useState(false)
  const [openDetail, setOpenDetail] = useState(false) // ✅ Thêm state cho modal chi tiết
  const [selectedTicket, setSelectedTicket] = useState<SupportMailbox | null>(null)

  const { data, isLoading, refetch } = useSupportMailboxes({ 
    page, 
    limit: 10, 
    search, 
    status: status || undefined 
  })
  const { mutateAsync: deleteSupportMailbox } = useDeleteSupportMailbox()

  const columns: ColumnsType<SupportMailbox> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: SupportMailbox) => (
        <div>
          <div className="font-medium">{title}</div>
          {record.description && (
            <div className="text-gray-500 text-xs mt-1 line-clamp-2">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator: any) => (
        <div>
          <div className="font-medium">{creator?.name}</div>
          <div className="text-gray-500 text-xs">{creator?.email}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: SupportStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Phản hồi Admin',
      dataIndex: 'adminReply',
      key: 'adminReply',
      render: (adminReply: string) => (
        adminReply ? (
          <Tooltip title={adminReply}>
            <span className="text-green-600">✓ Đã phản hồi</span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">Chưa phản hồi</span>
        )
      ),
    },
    {
      title: 'Phản hồi Shop',
      dataIndex: 'shopReply',
      key: 'shopReply',
      render: (shopReply: string) => (
        shopReply ? (
          <Tooltip title={shopReply}>
            <span className="text-blue-600">✓ Đã phản hồi</span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">Chưa phản hồi</span>
        )
      ),
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
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTicket(record)
                setOpenDetail(true) // ✅ Mở modal chi tiết
              }}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTicket(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          
          {/* <Tooltip title="Phản hồi Admin">
            <MessageOutlined
              style={{ color: '#fa8c16', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTicket(record)
                setOpenAdminReply(true)
              }}
            />
          </Tooltip> */}
          
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa yêu cầu hỗ trợ',
                  content: `Bạn có chắc chắn muốn xóa yêu cầu "${record.title}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteSupportMailbox(record.id)
                      message.success('Xóa yêu cầu hỗ trợ thành công')
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

  const handleSearch = (value: string) => {
    setPage(1)
    setSearch(value)
  }

  const handleStatusFilter = (value: SupportStatus | '') => {
    setPage(1)
    setStatus(value)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            onSearch={handleSearch}
            allowClear
            className="w-[300px]"
          />
          
          <Select
            placeholder="Lọc theo trạng thái"
            value={status}
            onChange={handleStatusFilter}
            allowClear
            className="w-[200px]"
          >
            <Select.Option value="">Tất cả trạng thái</Select.Option>
            <Select.Option value={SupportStatus.PENDING}>
              {getStatusLabel(SupportStatus.PENDING)}
            </Select.Option>
            <Select.Option value={SupportStatus.IN_PROGRESS}>
              {getStatusLabel(SupportStatus.IN_PROGRESS)}
            </Select.Option>
            <Select.Option value={SupportStatus.RESOLVED}>
              {getStatusLabel(SupportStatus.RESOLVED)}
            </Select.Option>
            <Select.Option value={SupportStatus.CLOSED}>
              {getStatusLabel(SupportStatus.CLOSED)}
            </Select.Option>
            <Select.Option value={SupportStatus.CANCELLED}>
              {getStatusLabel(SupportStatus.CANCELLED)}
            </Select.Option>
          </Select>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo yêu cầu hỗ trợ
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
          showTotal: (total) => `Tổng ${total} yêu cầu hỗ trợ`,
          showSizeChanger: false,
        }}
        scroll={{ x: 1000 }}
      />

      <SupportMailboxCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <SupportMailboxUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        ticket={selectedTicket}
        refetch={refetch}
      />

      {/* <SupportMailboxAdminReplyModal
        open={openAdminReply}
        onClose={() => setOpenAdminReply(false)}
        ticket={selectedTicket}
        refetch={refetch}
      /> */}

      {/* ✅ Thêm Detail Modal */}
      <SupportMailboxDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        ticket={selectedTicket}
      />
    </div>
  )
}