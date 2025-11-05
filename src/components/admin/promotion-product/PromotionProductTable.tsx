'use client'

import { Table, Button, Image, Tag, Typography, Card, Space, Spin, Alert, Modal, Form, Input, Select, InputNumber, message, Tooltip } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { usePromotionProductsByPromotionId } from '@/hooks/promotion-product/usePromotionProductsByPromotionId'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { DiscountType, PromotionProduct } from '@/types/promotion-product.type'
import { PromotionProductCreateModal } from './PromotionProductCreateModal'
import { usePromotionOne } from '@/hooks/promotion/usePromotionOne'
import { useDeletePromotionProduct } from '@/hooks/promotion-product/useDeletePromotionProduct'
import { PromotionProductUpdateModal } from './PromotionProductUpdateModal'

const { Text, Title } = Typography

interface Props {
  promotionId?: number
}

export default function PromotionProductTable({ promotionId }: Props) {
  const router = useRouter()
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedPromotionProduct, setSelectedPromotionProduct] = useState<number | null>(null)
  const { mutateAsync: deletePromotionProduct } = useDeletePromotionProduct()


  // Lấy dữ liệu từ hooks
  const { 
    data: promotionProducts = [], 
    isLoading: productsLoading, 
    isError: productsError, 
    refetch
  } = usePromotionProductsByPromotionId(promotionId!)

  const { 
    data: promotionData, 
    isLoading: promotionLoading, 
    isError: promotionError 
  } = usePromotionOne(promotionId!)


  // Hàm tính giá sau giảm
  const getDiscountedPrice = (basePrice: number, type: DiscountType, value: number) => {
    if (type === DiscountType.PERCENT) {
      return basePrice - (basePrice * value) / 100
    }
    return basePrice - value
  }

  // Cột trong bảng
  const columns: ColumnsType<PromotionProduct> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Hình ảnh',
      key: 'thumb',
      width: 90,
      render: (_text, record) => (
        <Image
          src={record.product.thumb || "https://via.placeholder.com/60?text=No+Image"}
          alt={record.product.name}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          preview={false}
          fallback="https://via.placeholder.com/60?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      key: 'name',
      render: (_text, record) => (
        <Text 
          strong 
          style={{ maxWidth: 300 }}
          ellipsis={{ tooltip: record.product.name }}
        >
          {record.product.name}
        </Text>
      ),
    },
    {
      title: 'Giá gốc',
      key: 'basePrice',
      align: 'right',
      render: (_text, record) => (
        <Text delete type="secondary">
          {record.product.basePrice.toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Giá giảm',
      key: 'discountedPrice',
      align: 'right',
      render: (_text, record) => {
        const discounted = getDiscountedPrice(
          record.product.basePrice,
          record.discountType,
          record.discountValue
        )
        return (
          <Text strong type="danger">
            {discounted.toLocaleString('vi-VN')} đ
          </Text>
        )
      },
    },
    {
      title: 'Mức giảm',
      key: 'discount',
      align: 'center',
      render: (_text, record) => {
        if (record.discountType === DiscountType.PERCENT) {
          return <Tag color="volcano">-{record.discountValue}%</Tag>
        }
        return (
          <Tag color="green">
            -{record.discountValue.toLocaleString('vi-VN')} đ
          </Tag>
        )
      },
    },
    {
      title: 'SL còn lại',
      dataIndex: 'saleQuantity',
      key: 'saleQuantity',
      align: 'center',
      width: 100,
    },
    {
        title: 'Quà tặng kèm',
        key: 'gift',
        width: 220,
        align: 'center' as const,
        render: (_: any, record: any) => {
            // Nếu không có quà tặng
            if (!record.giftProductId || !record.giftProduct) {
            return (
                <Text type="secondary" italic>
                Không có
                </Text>
            )
            }

            const gift = record.giftProduct

            return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space size={6}>
                <GiftOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <Image
                    src={gift.thumb}
                    alt={gift.name}
                    width={36}
                    height={36}
                    style={{ borderRadius: 6, objectFit: 'cover' }}
                    preview={false}
                    fallback="https://via.placeholder.com/36?text=Gift"
                />
                <Text
                    strong
                    ellipsis={{ tooltip: gift.name }}
                    style={{ maxWidth: 120, fontSize: 13 }}
                >
                    {gift.name}
                </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 11, marginTop: -2 }}>
                ×{record.giftQuantity} (miễn phí)
                </Text>
            </Space>
            )
        },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_text, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedPromotionProduct(record.id)  // ✅ Set selected item
                setOpenUpdate(true)  // ✅ Mở modal update
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa sản phẩm khuyến mãi',
                  content: `Bạn có chắc chắn muốn xóa sản phẩm "${record.product.name}" khỏi chương trình khuyến mãi không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deletePromotionProduct(record.id)
                      message.success('Xóa sản phẩm khỏi chương trình thành công')
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

  // Nếu không có promotionId thì không render
  if (!promotionId) return null

  return (
    <div>
      {/* Header với thông tin khuyến mãi và nút quay lại */}
      <Card className="mb-4">
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            type="link"
            style={{ padding: 0, height: 'auto' }}
          >
            Quay lại danh sách khuyến mãi
          </Button>
          
          {/* Hiển thị trạng thái dữ liệu */}
          {promotionLoading ? (
            <Spin size="small" />
          ) : promotionError || !promotionData ? (
            <Alert
              message="Lỗi tải dữ liệu"
              description="Không thể tải thông tin chương trình khuyến mãi."
              type="error"
              showIcon
            />
          ) : (
            <>
              {/* Hiển thị thông tin chương trình khuyến mãi */}
              <Title level={4} style={{ margin: '8px 0 0 0' }}>
                {promotionData.name}
              </Title>
              <Text type="secondary">
                Từ {new Date(promotionData.startTime).toLocaleDateString('vi-VN')} 
                {' → '}
                {new Date(promotionData.endTime).toLocaleDateString('vi-VN')}
              </Text>
              {promotionData.description && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {promotionData.description}
                </Text>
              )}
            </>
          )}
        </Space>
      </Card>

      {/* Nút Thêm Mới */}
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setOpenCreate(true)}
      >
        Thêm sản phẩm mới
      </Button>

      {/* Table danh sách sản phẩm */}
      <Table
        columns={columns}
        dataSource={promotionProducts}
        loading={productsLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} sản phẩm`,
        }}
        scroll={{ x: 900 }}
        locale={{ 
          emptyText: 'Không có sản phẩm nào trong chương trình khuyến mãi này.' 
        }}
      />
      <PromotionProductCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        promotionId={promotionId!}
        refetch={refetch}
      />

       <PromotionProductUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        id={selectedPromotionProduct!}
        refetch={refetch}
      />
    </div>
  )
}
