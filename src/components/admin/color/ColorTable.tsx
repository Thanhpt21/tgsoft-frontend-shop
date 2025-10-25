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
import { Color } from '@/types/color.type'
import { useColors } from '@/hooks/color/useColors'
import { useDeleteColor } from '@/hooks/color/useDeleteColor'
import { ColorCreateModal } from './ColorCreateModal'
import { ColorUpdateModal } from './ColorUpdateModal'


export default function ColorTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)

  const { data, isLoading, refetch } = useColors({ page, limit: 10, search })
  const { mutateAsync: deleteColor, isPending: isDeleting } = useDeleteColor()

  const columns: ColumnsType<Color> = [
    {
        title: 'STT',
        key: 'index',
        width: 60,
        render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Tên màu',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mã màu',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <div
          style={{
            backgroundColor: code,
            width: 40,
            height: 20,
            borderRadius: 4,
            border: '1px solid #ddd',
          }}
          title={code}
        />
      ),
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
                setSelectedColor(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá màu',
                  content: `Bạn có chắc chắn muốn xoá màu "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteColor(record.id)
                      message.success('Xoá màu thành công')
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
            placeholder="Tìm kiếm màu..."
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
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <ColorCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ColorUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        color={selectedColor}
        refetch={refetch}
      />
    </div>
  )
}
