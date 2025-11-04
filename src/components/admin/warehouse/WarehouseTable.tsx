'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Warehouse } from '@/types/warehouse.type'
import { useWarehouses } from '@/hooks/warehouse/useWarehouses'
import { useDeleteWarehouse } from '@/hooks/warehouse/useDeleteWarehouse'
import { WarehouseCreateModal } from './WarehouseCreateModal'
import { WarehouseUpdateModal } from './WarehouseUpdateModal'


// Hàm trợ giúp để trích xuất địa chỉ từ JSON location
const getLocationAddress = (location: any) => {
  if (location && typeof location === 'object' && location.address) {
    return location.address
  }
  return 'N/A'
}

export default function WarehouseTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  const { data, isLoading, refetch } = useWarehouses({ page, limit: 10, search })
  const { mutateAsync: deleteWarehouse } = useDeleteWarehouse()

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string | null) => code || <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Tên nhà kho',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa chỉ (Location)',
      dataIndex: 'location',
      key: 'location',
      // Hiển thị trường 'address' từ object JSON 'location'
      render: (location: any) => {
        const address = getLocationAddress(location)
        return (
          <Tooltip title={address}>
            <span className="truncate max-w-xs block">{address}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
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
                setSelectedWarehouse(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa nhà kho',
                  content: `Bạn có chắc chắn muốn xóa nhà kho "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteWarehouse(record.id)
                      message.success('Xóa nhà kho thành công')
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
            placeholder="Tìm kiếm theo tên nhà kho..."
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

      <Button
        type="primary"
        onClick={() => setOpenCreate(true)}
        disabled={(data?.data?.length ?? 0) >= 1}
      >
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
          showTotal: (total) => `Tổng ${total} nhà kho`,
        }}
      />

      <WarehouseCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <WarehouseUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        warehouse={selectedWarehouse} 
        refetch={refetch}
      />
    </div>
  )
}