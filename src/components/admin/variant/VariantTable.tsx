'use client'

import { Table, Space, Tooltip, Input, Button, Modal, message, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PictureOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

import { VariantCreateModal } from './VariantCreateModal'
import { VariantUpdateModal } from './VariantUpdateModal'
import { ProductVariant } from '@/types/product-variant.type'
import { formatVND } from '@/utils/helpers'
import { useProductVariants } from '@/hooks/product-variant/useProductVariants'
import { useDeleteProductVariant } from '@/hooks/product-variant/useDeleteProductVariant'
import { InventoryModal } from '../inventory/InventoryModal'
import { getImageUrl } from '@/utils/getImageUrl'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'

interface Props {
  productId?: number // lấy từ route param hoặc props
}

export default function VariantTable({ productId }: Props) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [openInventory, setOpenInventory] = useState(false)

  // Nếu productId chưa có thì không fetch
  const { data, isLoading, refetch } = useProductVariants(productId)
  const { mutateAsync: deleteVariant } = useDeleteProductVariant()

  const { data: allAttributes } = useAllAttributes()
 const { data: allAttrValuesResponse } = useAttributeValues()
  const allAttrValues = allAttrValuesResponse?.data || []

    const resolveAttrDisplay = (attrValues: Record<string, any>) => {
      if (!attrValues || !allAttributes || !allAttrValues) return ''
      
      const display: string[] = []

      for (const [attrIdStr, valueIdStr] of Object.entries(attrValues)) {
        const attrId = Number(attrIdStr)
        const valueId = Number(valueIdStr)

        const attr = allAttributes.find((a: any) => a.id === attrId)
        const val = allAttrValues.find((v: any) => v.id === valueId)

        if (attr && val) {
          display.push(`${attr.name}: ${val.value}`)
        }
      }

      return display.join(', ')
    }

  const columns: ColumnsType<ProductVariant> = [
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
      width: 80,
      render: (thumb: string | null) => {
        const url = getImageUrl(thumb)
        if (!url)
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        return <Image src={url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 8 }} preview={false} />
      },
    },
    {
      title: 'SKU / Thuộc tính',
      key: 'variant',
      render: (record: ProductVariant) => (
        <div>
          <div>SKU: {record.sku}</div>
          {record.attrValues && (
            <div style={{ fontSize: '0.85em', color: 'gray' }}>
              {resolveAttrDisplay(record.attrValues)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      align: 'right',
      render: (record: ProductVariant) => <span>{formatVND(record.price ?? record.priceDelta)}</span>,
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
           <Tooltip title="Quản lý tồn kho">
            <InboxOutlined
              style={{ color: '#52c41a', cursor: 'pointer', fontSize: 16 }}
              onClick={() => {
                setSelectedVariant(record)
                setOpenInventory(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => { setSelectedVariant(record); setOpenUpdate(true) }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa biến thể',
                  content: `Bạn có chắc chắn muốn xóa biến thể này không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteVariant(record.id)
                      message.success('Xóa biến thể thành công')
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

  if (!productId) return null // chưa có productId, không render gì

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm biến thể..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}><SearchOutlined /> Tìm kiếm</Button>
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>Tạo mới</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data || []} // data là ProductVariant[]
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.length,
          current: page,
          pageSize: Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 10),
          onChange: (p) => setPage(p),
          showTotal: total => `Tổng ${total} biến thể`,
        }}
      />

      <VariantCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        productId={productId} // chắc chắn là number
      />

      <VariantUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        variant={selectedVariant}
        refetch={refetch}
      />

       {selectedVariant && (
        <InventoryModal
          open={openInventory}
          onClose={() => setOpenInventory(false)}
          productVariantId={selectedVariant.id}
          variantName={`SKU: ${selectedVariant.sku}`}
        />
      )}
    </div>
  )
}
