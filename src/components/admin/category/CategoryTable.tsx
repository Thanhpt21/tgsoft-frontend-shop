'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Image } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Category } from '@/types/category.type'
import { useCategories } from '@/hooks/category/useCategories'
import { useDeleteCategory } from '@/hooks/category/useDeleteCategory'
import { CategoryCreateModal } from './CategoryCreateModal'
import { CategoryUpdateModal } from './CategoryUpdateModal'
import { getImageUrl } from '@/utils/getImageUrl'

export default function CategoryTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const { data, isLoading, refetch } = useCategories({ page, limit: 10, search })
  const { mutateAsync: deleteCategory } = useDeleteCategory()

  const columns: ColumnsType<Category> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      width: 100,
      align: 'center',
      render: (thumb: string | null) => {
        const imageUrl = getImageUrl(thumb)
        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        }
        return (
          <Image
            src={imageUrl}
            alt="Category"
           width={40}
            height={40}
            className="object-cover rounded"
            preview={false}
          />
        )
      },
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'orange' : 'red'
        return <Tag color={color}>{status}</Tag>
      },
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
                setSelectedCategory(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa danh mục',
                  content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCategory(record.id)
                      message.success('Xóa danh mục thành công')
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

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm danh mục..."
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
          showTotal: (total) => `Tổng ${total} danh mục`,
        }}
      />

      <CategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <CategoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        category={selectedCategory}
        refetch={refetch}
      />
    </div>
  )
}
