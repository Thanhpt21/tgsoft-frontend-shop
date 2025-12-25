import { Modal, Table, Tag, Spin, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'

interface Lead {
  id: number
  bot_id: number
  name: string
  phone: string
  email: string | null
  status: string
  note: string
  created_at: string
  updated_at: string
}

interface LeadsResponse {
  current_page: number
  data: Lead[]
  total: number
  per_page: number
  last_page: number
}

interface LeadsModalProps {
  open: boolean
  onClose: () => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Mới', color: 'blue' },
  contacted: { label: 'Đã liên hệ', color: 'orange' },
  converted: { label: 'Đã chuyển đổi', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
}

export function LeadsModal({ open, onClose }: LeadsModalProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchLeads = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AIBAN_API_URL}/leads?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Không thể tải danh sách khách hàng')
      }

      const result = await response.json()
      setData(result)
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchLeads(currentPage)
    }
  }, [open, currentPage])

  const columns: ColumnsType<Lead> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (currentPage - 1) * 20 + index + 1,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 font-medium">
            <UserOutlined />
            {record.name}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <PhoneOutlined />
            {record.phone}
          </div>
          {record.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <MailOutlined />
              {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => (
        <div className="text-sm text-gray-600">{note || '-'}</div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) => (
        <div className="text-xs text-gray-500">
          {new Date(date).toLocaleString('vi-VN')}
        </div>
      ),
    },
  ]

  return (
    <Modal
      title="Danh sách khách hàng từ AI Chat Bot"
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          pagination={{
            total: data?.total || 0,
            current: currentPage,
            pageSize: data?.per_page || 20,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
          scroll={{ x: 800 }}
        />
      </Spin>
    </Modal>
  )
}