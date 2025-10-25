'use client'

import {
  Table,
  Image,
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

import { useBlogCategories } from '@/hooks/blog-category/useBlogCategories'
import { useDeleteBlogCategory } from '@/hooks/blog-category/useDeleteBlogCategory'
import { BlogCategoryCreateModal } from './BlogCategoryCreateModal'
import { BlogCategoryUpdateModal } from './BlogCategoryUpdateModal'
import { BlogCategory } from '@/types/blog-category.type'

export default function BlogCategoryTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)

  const { data, isLoading, refetch } = useBlogCategories({ page, limit: 10, search })
  const { mutateAsync: deleteBlogCategory } = useDeleteBlogCategory()

  const columns: ColumnsType<BlogCategory> = [
      {
        title: 'STT',
        key: 'index',
        width: 60,
        render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="Thumb"
            height={40}
            width={40}
            style={{ borderRadius: 8, objectFit: 'cover' }}
          />
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
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
                  title: 'Xác nhận xoá danh mục blog',
                  content: `Bạn có chắc chắn muốn xoá danh mục blog "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteBlogCategory(record.id)
                      message.success('Xoá danh mục blog thành công')
                      refetch?.()
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
            placeholder="Tìm kiếm danh mục blog..."
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

      <BlogCategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <BlogCategoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        blogCategory={selectedCategory}
        refetch={refetch}
      />
    </div>
  )
}
