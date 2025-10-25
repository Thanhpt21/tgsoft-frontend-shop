'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Attribute } from '@/types/attribute.type'
import { useAttributes } from '@/hooks/attribute/useAttributes'
import { useDeleteAttribute } from '@/hooks/attribute/useDeleteAttribute'
import { AttributeCreateModal } from './AttributeCreateModal'
import { AttributeUpdateModal } from './AttributeUpdateModal'
import { AttributeValueTable } from '../attribute-values/AttributeValueTable'


// import { AttributeCreateModal } from './AttributeCreateModal'
// import { AttributeUpdateModal } from './AttributeUpdateModal'

export default function AttributeTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [openValues, setOpenValues] = useState(false)

  const { data, isLoading, refetch } = useAttributes({ page, limit: 10, search })
  const { mutateAsync: deleteAttribute } = useDeleteAttribute()

  const columns: ColumnsType<Attribute> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên thuộc tính',
      dataIndex: 'name',
      key: 'name',
    },
   {
        title: 'Thứ tự',
        dataIndex: 'position',
        key: 'position',
        render: (pos: number) => <Tag color="green">{pos}</Tag>,
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
            <Tooltip title="Giá trị thuộc tính">
            <AppstoreOutlined
            style={{ color: '#52c41a', cursor: 'pointer' }}
            onClick={() => {
                setSelectedAttribute(record)
                setOpenValues(true)
            }}
            />
        </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedAttribute(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa thuộc tính',
                  content: `Bạn có chắc chắn muốn xóa thuộc tính "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteAttribute(record.id)
                      message.success('Xóa thuộc tính thành công')
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
            placeholder="Tìm kiếm theo tên thuộc tính..."
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
          showTotal: (total) => `Tổng ${total} thuộc tính`,
        }}
      />

      <AttributeCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <AttributeUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        attribute={selectedAttribute}
        refetch={refetch}
      />

      <Modal
        open={openValues}
        title={`Giá trị thuộc tính: ${selectedAttribute?.name}`}
        onCancel={() => setOpenValues(false)}
        footer={null}
        width={700}
        >
        {selectedAttribute && (
            <AttributeValueTable attributeId={selectedAttribute.id} />
        )}
        </Modal>

    </div>
  )
}
