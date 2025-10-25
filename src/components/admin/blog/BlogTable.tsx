'use client'

import {
  Table,
  Tag,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Image,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Blog } from '@/types/blog.type'
import { useBlogs } from '@/hooks/blog/useBlogs'
import { useDeleteBlog } from '@/hooks/blog/useDeleteBlog'
import { BlogCreateModal } from './BlogCreateModal'
import { getImageUrl } from '@/utils/getImageUrl'
import { BlogUpdateModal } from './BlogUpdateModal'

export default function BlogTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  const { data, isLoading, refetch } = useBlogs({ page, limit: 10, search })
  const { mutateAsync: deleteBlog } = useDeleteBlog()

  const handlePreview = (thumb: string | null) => {
    const imageUrl = getImageUrl(thumb)
    if (!imageUrl) return
    setPreviewImage(imageUrl)
    setPreviewVisible(true)
  }

  const columns: ColumnsType<Blog> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      width: 100,
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
            alt="Thumbnail"
            width={50}
            height={50}
            className="object-cover rounded cursor-pointer"
            preview={false}
            onClick={() => handlePreview(thumb)}
          />
        )
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Người đăng',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
    },
    {
      title: 'Xuất bản',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'red'}>
          {isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
        </Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'numberViews',
      key: 'numberViews',
      sorter: (a, b) => a.numberViews - b.numberViews,
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
                setSelectedBlog(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa blog',
                  content: `Bạn có chắc chắn muốn xóa blog "${record.title}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteBlog(record.id)
                      message.success('Xóa blog thành công')
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
            placeholder="Tìm kiếm blog..."
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
          showTotal: (total) => `Tổng ${total} blog`,
        }}
      />

      <BlogCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <BlogUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        blog={selectedBlog}
        refetch={refetch}
      />

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%' }} />}
      </Modal>
    </div>
  )
}
