'use client'

import { Modal, Button, Table, Checkbox, Image, Input, message, Select, InputNumber, Space } from 'antd'
import { SearchOutlined, PictureOutlined, GiftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAllProducts } from '@/hooks/product/useAllProducts'
import { useCreatePromotionProduct } from '@/hooks/promotion-product/useCreatePromotionProduct'
import { DiscountType } from '@/types/promotion-product.type'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  open: boolean
  onClose: () => void
  promotionId: number
  refetch?: () => void
}

interface ProductRow {
  id: number
  name: string
  thumb: string | null
  basePrice: number
  selected: boolean
  discountType: DiscountType
  discountValue: number
  saleQuantity: number
  giftProductId: number | null
  giftProductName?: string
  giftQuantity: number
}

export const PromotionProductCreateModal: React.FC<Props> = ({
  open,
  onClose,
  promotionId,
  refetch,
}) => {
  const [search, setSearch] = useState('')
  const [productRows, setProductRows] = useState<Record<number, ProductRow>>({})
  const [giftModalVisible, setGiftModalVisible] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<number | null>(null)
  const [giftSearch, setGiftSearch] = useState('')
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null)
  const [tempGiftQuantity, setTempGiftQuantity] = useState(1)

  const { data: products = [], isLoading } = useAllProducts(search)
  const { data: giftProducts = [], isLoading: loadingGifts } = useAllProducts(giftSearch)
  const { mutateAsync: createPromotionProduct, isPending } = useCreatePromotionProduct()

  // Khởi tạo row data cho product
  const getProductRow = (productId: number, product: any): ProductRow => {
    if (productRows[productId]) {
      return productRows[productId]
    }
    return {
      id: productId,
      name: product.name,
      thumb: product.thumb,
      basePrice: product.basePrice,
      selected: false,
      discountType: DiscountType.PERCENT,
      discountValue: 0,
      saleQuantity: 1,
      giftProductId: null,
      giftQuantity: 0,
    }
  }

  // Cập nhật row data
  const updateProductRow = (productId: number, updates: Partial<ProductRow>) => {
    setProductRows(prev => ({
      ...prev,
      [productId]: {
        ...getProductRow(productId, products.find((p: any) => p.id === productId)),
        ...prev[productId],
        ...updates,
      }
    }))
  }

  // Columns chính
  const columns: ColumnsType<any> = [
    {
      title: '',
      key: 'checkbox',
      width: 50,
      fixed: 'left',
      render: (_text, record) => {
        const row = getProductRow(record.id, record)
        return (
          <Checkbox
            checked={row.selected}
            onChange={(e) => {
              updateProductRow(record.id, { selected: e.target.checked })
            }}
          />
        )
      },
    },
    {
      title: 'Hình ảnh',
      key: 'thumb',
      width: 90,
      fixed: 'left',
      render: (_text, record) => {
        if (!record.thumb) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        }
        return (
          <Image
            src={record.thumb}
            alt={record.name}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            preview={false}
          />
        )
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
    },
    {
      title: 'Giá gốc',
      key: 'basePrice',
      width: 150,
      align: 'right',
      render: (_text, record) => `${record.basePrice.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Loại giảm giá',
      key: 'discountType',
      width: 180,
      render: (_text, record) => {
        const row = getProductRow(record.id, record)
        return (
          <Select
            value={row.discountType}
            disabled={!row.selected}
            onChange={(value) => updateProductRow(record.id, { discountType: value })}
            style={{ width: '100%' }}
          >
            <Select.Option value={DiscountType.PERCENT}>Giảm %</Select.Option>
            <Select.Option value={DiscountType.FIXED}>Giảm giá cố định</Select.Option>
          </Select>
        )
      },
    },
    {
      title: 'Giá trị giảm',
      key: 'discountValue',
      width: 150,
      render: (_text, record) => {
        const row = getProductRow(record.id, record)
        return (
          <InputNumber
            value={row.discountValue}
            disabled={!row.selected}
            min={0}
            max={row.discountType === DiscountType.PERCENT ? 100 : undefined}
            onChange={(value) => updateProductRow(record.id, { discountValue: value || 0 })}
            style={{ width: '100%' }}
            addonAfter={row.discountType === DiscountType.PERCENT ? '%' : 'đ'}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        )
      },
    },
    {
      title: 'Số lượng',
      key: 'saleQuantity',
      width: 120,
      render: (_text, record) => {
        const row = getProductRow(record.id, record)
        return (
          <InputNumber
            value={row.saleQuantity}
            disabled={!row.selected}
            min={1}
            onChange={(value) => updateProductRow(record.id, { saleQuantity: value || 1 })}
            style={{ width: '100%' }}
          />
        )
      },
    },
    {
      title: 'Quà tặng kèm',
      key: 'gift',
      width: 200,
      render: (_text, record) => {
        const row = getProductRow(record.id, record)
        return (
          <Button
            disabled={!row.selected}
            onClick={() => {
              setCurrentProductId(record.id)
              // Reset state khi mở modal
              const currentGift = productRows[record.id]
              setSelectedGiftId(currentGift?.giftProductId || null)
              setTempGiftQuantity(currentGift?.giftQuantity || 1)
              setGiftModalVisible(true)
            }}
            block
          >
             {row.giftProductName 
            ? `${row.giftProductName} ${row.giftQuantity ? `x${row.giftQuantity})` : ''}` 
            : 'Chọn quà tặng'
            }
          </Button>
        )
      },
    },
  ]

  // Columns cho modal chọn quà tặng - ✅ THAY ĐỔI Ở ĐÂY
  const giftColumns: ColumnsType<any> = [
    {
      title: '',
      key: 'checkbox',
      width: 60,
      render: (_text, record) => (
        <Checkbox
          checked={selectedGiftId === record.id}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedGiftId(record.id)
              setTempGiftQuantity(1) // Reset về 1 khi chọn mới
            } else {
              setSelectedGiftId(null)
              setTempGiftQuantity(1)
            }
          }}
        />
      ),
    },
    {
      title: 'Hình ảnh',
      key: 'thumb',
      width: 90,
      render: (_text, record) => {
        if (!record.thumb) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        }
        return (
          <Image
            src={record.thumb}
            alt={record.name}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            preview={false}
          />
        )
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      key: 'basePrice',
      align: 'right',
      render: (_text, record) => `${record.basePrice.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Số lượng tặng',
      key: 'quantity',
      width: 150,
      render: (_text, record) => (
        <InputNumber
          value={selectedGiftId === record.id ? tempGiftQuantity : 0}
          disabled={selectedGiftId !== record.id}
          min={1}
          onChange={(value) => {
            if (selectedGiftId === record.id) {
              setTempGiftQuantity(value || 1)
            }
          }}
          style={{ width: '100%' }}
        />
      ),
    },
  ]

  const handleSubmit = async () => {
    try {
      const selectedProducts = Object.values(productRows).filter(row => row.selected)

      if (selectedProducts.length === 0) {
        message.warning('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      // Validate
      for (const product of selectedProducts) {
        if (product.discountValue <= 0) {
          message.error(`Vui lòng nhập giá trị giảm cho sản phẩm "${product.name}"`)
          return
        }
        if (product.discountType === DiscountType.PERCENT && product.discountValue > 100) {
          message.error(`Giá trị giảm % không được vượt quá 100 cho sản phẩm "${product.name}"`)
          return
        }
      }

      // Tạo từng sản phẩm khuyến mãi
      for (const product of selectedProducts) {
        const payload = {
          promotionId,
          productId: product.id,
          discountType: product.discountType,
          discountValue: product.discountValue,
          saleQuantity: product.saleQuantity,
          giftProductId: product.giftProductId,
          giftQuantity: product.giftProductId ? product.giftQuantity : 0,
        }
        await createPromotionProduct(payload) 
      }

      message.success(`Đã thêm ${selectedProducts.length} sản phẩm khuyến mãi thành công`)
      handleClose()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Thêm sản phẩm thất bại')
    }
  }

  const handleClose = () => {
    setProductRows({})
    setSearch('')
    setGiftSearch('')
    onClose()
  }

  // ✅ Thêm handler để xác nhận chọn quà tặng
  const handleConfirmGift = () => {
    if (currentProductId && selectedGiftId) {
      const selectedGift = giftProducts.find((p: any) => p.id === selectedGiftId)
      updateProductRow(currentProductId, {
        giftProductId: selectedGiftId,
        giftProductName: selectedGift?.name,
        giftQuantity: tempGiftQuantity,
      })
    } else if (currentProductId) {
      // Nếu bỏ chọn tất cả, clear gift
      updateProductRow(currentProductId, {
        giftProductId: null,
        giftProductName: undefined,
        giftQuantity: 0,
      })
    }
    setGiftModalVisible(false)
    setGiftSearch('')
    setSelectedGiftId(null)
    setTempGiftQuantity(1)
  }

  return (
    <>
      {/* Modal chính */}
      <Modal
        title="Thêm sản phẩm vào chương trình khuyến mãi"
        open={open}
        onCancel={handleClose}
        width={1300}
        footer={
          <Space>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" onClick={handleSubmit} loading={isPending}>
              Thêm vào chương trình
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={products}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100, y: 400 }}
        />
      </Modal>

      {/* Modal chọn quà tặng - ✅ CẬP NHẬT FOOTER */}
      <Modal
        title="Chọn quà tặng kèm"
        open={giftModalVisible}
        onCancel={() => {
          setGiftModalVisible(false)
          setGiftSearch('')
          setSelectedGiftId(null)
          setTempGiftQuantity(1)
        }}
        width={900}
        footer={
          <Space>
            <Button onClick={() => {
              setGiftModalVisible(false)
              setGiftSearch('')
              setSelectedGiftId(null)
              setTempGiftQuantity(1)
            }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleConfirmGift}>
              Xác nhận
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm quà tặng..."
            prefix={<SearchOutlined />}
            value={giftSearch}
            onChange={(e) => setGiftSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={giftColumns}
          dataSource={giftProducts}
          loading={loadingGifts}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </Modal>
    </>
  )
}