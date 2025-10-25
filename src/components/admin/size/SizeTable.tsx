'use client'

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Size } from '@/types/size.type'
import { useSizes } from '@/hooks/size/useSizes'
import { useDeleteSize } from '@/hooks/size/useDeleteSize'
import { SizeCreateModal } from './SizeCreateModal'
import { SizeUpdateModal } from './SizeUpdateModal'


export default function SizeTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)

  const { data, isLoading, refetch } = useSizes({ page, limit: 10, search })
  const { mutateAsync: deleteSize, isPending: isDeleting } = useDeleteSize()

  const columns: ColumnsType<Size> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) =>
        (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Tên kích cỡ',
      dataIndex: 'title',
      key: 'title',
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
                setSelectedSize(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá kích cỡ',
                  content: `Bạn có chắc chắn muốn xoá kích cỡ "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteSize(record.id)
                      message.success('Xoá thành công')
                      refetch()
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm kích cỡ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
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
        loading={isLoading || isDeleting}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <SizeCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <SizeUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        size={selectedSize}
        refetch={refetch}
      />
    </div>
  )
}
