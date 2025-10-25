'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Payout } from '@/types/payout.type'
import { usePayouts } from '@/hooks/payout/usePayouts'
import { useDeletePayout } from '@/hooks/payout/useDeletePayout'
import { PayoutCreateModal } from './PayoutCreateModal'
import { PayoutUpdateModal } from './PayoutUpdateModal'


export default function PayoutTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)

  const { data, isLoading, refetch } = usePayouts({ page, limit: 10, search })
  const { mutateAsync: deletePayout } = useDeletePayout()

  const columns: ColumnsType<Payout> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Người nhận',
      dataIndex: 'receiverType',
      key: 'receiverType',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) =>
        `${amount.toLocaleString('vi-VN')} ${record.currency}`,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method: string | null) => method || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'COMPLETED'
            ? 'green'
            : status === 'PENDING'
            ? 'orange'
            : 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Ngày xử lý',
      dataIndex: 'processedAt',
      key: 'processedAt',
      render: (date: string | null) =>
        date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedPayout(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa phiếu chi',
                  content: `Bạn có chắc muốn xóa phiếu chi #${record.id}?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deletePayout(record.id)
                      message.success('Xóa phiếu chi thành công')
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
            placeholder="Tìm kiếm theo phương thức hoặc mã tham chiếu..."
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
          showTotal: (total) => `Tổng ${total} phiếu chi`,
        }}
      />

      <PayoutCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <PayoutUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        payout={selectedPayout}
        refetch={refetch}
      />
    </div>
  )
}
