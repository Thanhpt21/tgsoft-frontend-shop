'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PictureOutlined, CheckOutlined, CloseOutlined, AppstoreAddOutlined, MedicineBoxOutlined, SkinOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import type { Product } from '@/types/product.type'
import { useProducts } from '@/hooks/product/useProducts'
import { useDeleteProduct } from '@/hooks/product/useDeleteProduct'
import { ProductCreateModal } from './ProductCreateModal'
import { ProductUpdateModal } from './ProductUpdateModal'
import { AssignAttributeModal } from './AssignAttributeModal'
import { Link } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/utils/getImageUrl'

export default function ProductTable() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [openAssign, setOpenAssign] = useState(false)

  const { data, isLoading, refetch } = useProducts({ page, limit: 10, search })
  const { mutateAsync: deleteProduct } = useDeleteProduct()


  const columns: ColumnsType<Product> = [
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
        const url = getImageUrl(thumb)
        if (!url)
          return <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
            <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
          </div>
        return <Image src={url}  width={40} height={40} className="object-cover rounded" preview={false} />
      },
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '-',
    },

    {
      title: 'Đã xuất bản',
      dataIndex: 'isPublished',
      key: 'isPublished',
      align: 'center',
      render: (isPublished: boolean) => (
        isPublished 
          ? <CheckOutlined style={{ color: 'green', fontSize: 18 }} /> 
          : <CloseOutlined style={{ color: 'red', fontSize: 18 }} />
      ),
    },

    // Nổi bật
    {
      title: 'Nổi bật',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      align: 'center',
      render: (isFeatured: boolean) => (
        isFeatured 
          ? <CheckOutlined style={{ color: 'blue', fontSize: 18 }} /> 
          : <CloseOutlined style={{ color: 'gray', fontSize: 18 }} />
      ),
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
      width: 140,
      render: (_, record) => (
        <Space size="middle">
            <Tooltip title="Quản lý biến thể">
            <SkinOutlined
              style={{ color: '#fa8c16', cursor: 'pointer', fontSize: 16 }}
              onClick={() => router.push(`/admin/variant/${record.id}`)} // dynamic route
            />
          </Tooltip>
          <Tooltip title="Gán thuộc tính">
            <MedicineBoxOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => { setSelectedProduct(record); setOpenAssign(true) }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => { setSelectedProduct(record); setOpenUpdate(true) }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa sản phẩm',
                  content: `Bạn có chắc chắn muốn xóa "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteProduct(record.id)
                      message.success('Xóa sản phẩm thành công')
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

  const handleSearch = () => { setPage(1); setSearch(inputValue) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>Tạo mới</Button>
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
          showTotal: (total) => `Tổng ${total} sản phẩm`,
        }}
      />

      <ProductCreateModal open={openCreate} onClose={() => setOpenCreate(false)} refetch={refetch} />
      <ProductUpdateModal open={openUpdate} onClose={() => setOpenUpdate(false)} product={selectedProduct} refetch={refetch} />
      <AssignAttributeModal
        productId={selectedProduct?.id!}
        open={openAssign}
        onClose={() => setOpenAssign(false)}
      />
    </div>
  )
}
