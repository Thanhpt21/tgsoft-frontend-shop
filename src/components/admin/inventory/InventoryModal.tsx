// InventoryModal.tsx
'use client'

import { Modal, Table, Button, Space, Tooltip, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useInventories } from '@/hooks/inventory/useInventories'
import { useDeleteInventory } from '@/hooks/inventory/useDeleteInventory'
import { InventoryCreateModal } from './InventoryCreateModal'
import { InventoryUpdateModal } from './InventoryUpdateModal'


interface Inventory {
  id: number
  productVariantId: number
  warehouseId: number
  warehouse: {
    id: number
    name: string
  }
  qty: number
  createdAt: string
}

interface Props {
  open: boolean
  onClose: () => void
  productVariantId: number
  variantName?: string // Tên variant để hiển thị trong title
}

export function InventoryModal({ open, onClose, productVariantId, variantName }: Props) {
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)

  const { data: inventories, isLoading, refetch } = useInventories({ productVariantId })
  const { mutateAsync: deleteInventory } = useDeleteInventory()

  const columns: ColumnsType<Inventory> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Tên kho',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouseName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      render: (qty: number) => (
        <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>
          {qty.toLocaleString()}
        </span>
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
      width: 120,
      render: (_text, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedInventory(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa',
                  content: `Bạn có chắc chắn muốn xóa tồn kho tại "${record.warehouse.name}"?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteInventory(record.id)
                      message.success('Xóa tồn kho thành công')
                      refetch?.()
                    } catch (err: any) {
                      message.error(err?.response?.data?.message || 'Xóa thất bại')
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

   const totalqty = inventories?.reduce((sum: number, item: Inventory) => sum + item.qty, 0) || 0

  return (
    <>
      <Modal
        title={
          <div>
            <div>Quản lý tồn kho</div>
            {variantName && <div className="text-sm text-gray-500 font-normal">{variantName}</div>}
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-base">
            Tổng tồn kho: <span className="font-semibold text-blue-600">{totalqty.toLocaleString()}</span>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
            Thêm tồn kho
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={inventories || []}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'Chưa có dữ liệu tồn kho' }}
        />
      </Modal>

      <InventoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        productVariantId={productVariantId}
      />

      <InventoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        inventory={selectedInventory}
        refetch={refetch}
      />
    </>
  )
}
