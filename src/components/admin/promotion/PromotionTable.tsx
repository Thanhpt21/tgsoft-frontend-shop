'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Promotion } from '@/types/promotion.type'
import { usePromotions } from '@/hooks/promotion/usePromotions'
import { useDeletePromotion } from '@/hooks/promotion/useDeletePromotion'
import { PromotionCreateModal } from './PromotionCreateModal'
import { PromotionUpdateModal } from './PromotionUpdateModal'
import { useRouter } from 'next/navigation'

export default function PromotionTable() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [openProductsModal, setOpenProductsModal] = useState(false)  
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null)  

  const { data, isLoading, refetch } = usePromotions({ page, limit: 10, search })
  const { mutateAsync: deletePromotion } = useDeletePromotion()

  const columns: ColumnsType<Promotion> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên chương trình',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Flash Sale',
      dataIndex: 'isFlashSale',
      key: 'isFlashSale',
      align: 'center',
      render: (isFlashSale: boolean) =>
        isFlashSale
          ? <CheckOutlined style={{ color: 'green', fontSize: 18 }} />
          : <CloseOutlined style={{ color: 'gray', fontSize: 18 }} />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'orange' : 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
           <Tooltip title="Quản lý sản phẩm khuyến mãi">
            <EyeOutlined
              style={{ color: 'green', cursor: 'pointer', fontSize: 16 }}
               onClick={() => router.push(`/admin/promotion-product/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedPromotion(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa chương trình khuyến mãi',
                  content: `Bạn có chắc chắn muốn xóa chương trình "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deletePromotion(record.id)
                      message.success('Xóa chương trình thành công')
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
            placeholder="Tìm kiếm theo tên chương trình..."
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
          showTotal: (total) => `Tổng ${total} chương trình`,
        }}
      />

      <PromotionCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <PromotionUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        promotion={selectedPromotion}
        refetch={refetch}
      />
       
    </div>
  )
}
