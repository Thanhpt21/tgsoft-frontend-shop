'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { AttributeValue } from '@/types/attribute-value.type'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'
import { useDeleteAttributeValue } from '@/hooks/attribute-value/useDeleteAttributeValue'
import { AttributeValueCreateModal } from './AttributeValueCreateModal'
import { AttributeValueUpdateModal } from './AttributeValueUpdateModal'


interface AttributeValueTableProps {
  attributeId: number
}

export const AttributeValueTable = ({ attributeId }: AttributeValueTableProps) => {
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedValue, setSelectedValue] = useState<AttributeValue | null>(null)

  const { data, isLoading, refetch } = useAttributeValues({ attributeId })
  const { mutateAsync: deleteValue } = useDeleteAttributeValue()

  const columns: ColumnsType<AttributeValue> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (v) => <Tag color="blue">{v}</Tag>,
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
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedValue(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa giá trị',
                  content: `Bạn có chắc chắn muốn xóa "${record.value}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteValue(record.id)
                      message.success('Xóa thành công')
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

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Danh sách giá trị</h3>
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm giá trị
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />

      <AttributeValueCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        attributeId={attributeId}
      />

      <AttributeValueUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        attributeValue={selectedValue}
        refetch={refetch}
      />
    </div>
  )
}
