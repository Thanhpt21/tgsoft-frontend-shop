'use client'

import { Modal, Form, Select, InputNumber, Button, Space, message, Spin, Input, Checkbox } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useUpdatePromotionProduct } from '@/hooks/promotion-product/useUpdatePromotionProduct'
import { useAllProducts } from '@/hooks/product/useAllProducts'
import { usePromotionProductOne } from '@/hooks/promotion-product/usePromotionProductOne'
import { DiscountType } from '@/types/promotion-product.type'

interface Props {
  open: boolean
  onClose: () => void
  id: number
  refetch?: () => void
}

export const PromotionProductUpdateModal: React.FC<Props> = ({
  open,
  onClose,
  id,
  refetch,
}) => {
  const [form] = Form.useForm()
  const [giftModalVisible, setGiftModalVisible] = useState(false)
  const [giftSearch, setGiftSearch] = useState('')
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null)
  const [selectedGiftName, setSelectedGiftName] = useState<string>('')
  
  const [giftQuantity, setGiftQuantity] = useState(1)

  // Lấy dữ liệu chi tiết
  const { data: promotionProduct, isLoading } = usePromotionProductOne(id)
  const { data: giftProducts = [], isLoading: loadingGifts } = useAllProducts(giftSearch)
  const { mutateAsync: updatePromotionProduct, isPending } = useUpdatePromotionProduct()


  // Set form khi có data
    useEffect(() => {
    if (open && promotionProduct) {
        // Khi mở modal và có dữ liệu `promotionProduct`
        form.setFieldsValue({
        discountType: promotionProduct.discountType,
        discountValue: promotionProduct.discountValue,
        saleQuantity: promotionProduct.saleQuantity,
        });

        // Kiểm tra và set lại quà tặng nếu có
        if (promotionProduct.giftProductId && promotionProduct.giftProduct) {
        setSelectedGiftId(promotionProduct.giftProductId);
        setSelectedGiftName(promotionProduct.giftProduct.name);
        setGiftQuantity(promotionProduct.giftQuantity || 1);
        } else {
        // Nếu không có quà tặng, reset lại
        setSelectedGiftId(null);
        setSelectedGiftName('');
        setGiftQuantity(1);
        }
    } else {
        // Nếu modal không mở, reset tất cả trạng thái quà tặng
        setSelectedGiftId(null);
        setSelectedGiftName('');
        setGiftQuantity(1);
    }
    }, [open, promotionProduct, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        discountType: values.discountType,
        discountValue: values.discountValue,
        saleQuantity: values.saleQuantity,
        giftProductId: selectedGiftId,
        giftQuantity: selectedGiftId ? giftQuantity : 0,
      }

      await updatePromotionProduct({ id, data: payload })
      message.success('Cập nhật thành công')
      handleClose()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const displayGiftProducts = useMemo(() => {
    if (!selectedGiftId || !promotionProduct?.giftProduct) return giftProducts

    const isGiftInList = giftProducts.some((p: any) => p.id === selectedGiftId)
    if (isGiftInList) return giftProducts

    return [
        {
        id: promotionProduct.giftProductId,
        name: promotionProduct.giftProduct.name,
        thumb: promotionProduct.giftProduct.thumb,
        basePrice: promotionProduct.giftProduct.basePrice,
        },
        ...giftProducts,
    ]
    }, [giftProducts, selectedGiftId, promotionProduct])

  const handleClose = () => {
    form.resetFields()
    setSelectedGiftId(null)
    setSelectedGiftName('')
    setGiftQuantity(1)
    setGiftSearch('')
    onClose()
  }



  const handleRemoveGift = () => {
    setSelectedGiftId(null)
    setSelectedGiftName('')
    setGiftQuantity(1)
  }

  if (isLoading) {
    return (
      <Modal open={open} footer={null} onCancel={onClose}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Đang tải thông tin..." />
        </div>
      </Modal>
    )
  }

  if (!promotionProduct) return null

  return (
    <>
      <Modal
        title={`Chỉnh sửa: ${promotionProduct.product.name}`}
        open={open}
        onCancel={handleClose}
        width={600}
        style={{ zIndex: 1 }}
        footer={
          <Space>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()} loading={isPending}>
              Cập nhật
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}>
            <Select>
              <Select.Option value={DiscountType.PERCENT}>Giảm %</Select.Option>
              <Select.Option value={DiscountType.FIXED}>Giảm giá cố định</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, next) => prev.discountType !== next.discountType}>
            {({ getFieldValue }) => {
              const type = getFieldValue('discountType')
              return (
                <Form.Item
                  name="discountValue"
                  label="Giá trị giảm"
                  rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={type === DiscountType.PERCENT ? 100 : undefined}
                    addonAfter={type === DiscountType.PERCENT ? '%' : 'đ'}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            name="saleQuantity"
            label="Số lượng bán"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
            <Form.Item label="Quà tặng kèm">
            <Space direction="vertical" style={{ width: '100%' }}>
                {selectedGiftId ? (
                <Space style={{ width: '100%', justifyContent: 'space-between', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                    <span>
                    <strong>{selectedGiftName}</strong>
                    <span style={{ marginLeft: 8, color: '#666' }}>(SL: {giftQuantity})</span>
                    </span>
                    <Button size="small" danger onClick={handleRemoveGift}>
                    Xóa
                    </Button>
                </Space>
                ) : (
                <Button onClick={() => setGiftModalVisible(true)}>Chọn quà tặng</Button>
                )}

                {/* Danh sách chọn quà tặng - inline thay vì modal */}
                {giftModalVisible && !selectedGiftId && (
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: 16, marginTop: 12, maxHeight: 400, overflowY: 'auto' }}>
                    <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    style={{ marginBottom: 16 }}
                    allowClear
                    />

                    {loadingGifts ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin />
                    </div>
                    ) : displayGiftProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        Không tìm thấy sản phẩm
                    </div>
                    ) : (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {displayGiftProducts.map((gift: any) => (
                        <div
                            key={gift.id}
                            style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            backgroundColor: selectedGiftId === gift.id ? '#e6f7ff' : 'white',
                            transition: 'all 0.2s',
                            }}
                        >
                            <Checkbox
                            checked={selectedGiftId === gift.id}
                            onChange={() => {
                                setSelectedGiftId(gift.id)
                                setSelectedGiftName(gift.name)
                                setGiftQuantity(1)
                            }}
                            style={{ marginRight: 12 }}
                            />

                            <img
                            src={gift.thumb || 'https://via.placeholder.com/50'}
                            alt={gift.name}
                            style={{ width: 50, height: 50, borderRadius: 4, marginRight: 12, objectFit: 'cover' }}
                            />

                            <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{gift.name}</div>
                            <div style={{ color: '#666', fontSize: 12 }}>
                                {gift.basePrice.toLocaleString('vi-VN')} đ
                            </div>
                            </div>

                            {selectedGiftId === gift.id && (
                            <InputNumber
                                min={1}
                                value={giftQuantity}
                                onChange={(v) => setGiftQuantity(v || 1)}
                                style={{ width: 80 }}
                                addonBefore="SL"
                            />
                            )}
                        </div>
                        ))}
                    </Space>
                    )}

                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Button onClick={() => {
                        setGiftModalVisible(false)
                        setGiftSearch('')
                    }}>
                        Đóng
                    </Button>
                    </div>
                </div>
                )}

                {/* Hiển thị số lượng nếu đã chọn quà tặng (ngoài vùng chọn) */}
                {selectedGiftId && !giftModalVisible && (
                <InputNumber
                    min={1}
                    value={giftQuantity}
                    onChange={(v) => setGiftQuantity(v || 1)}
                    style={{ width: '100%', marginTop: 8 }}
                    addonBefore="Số lượng tặng"
                />
                )}
            </Space>
            </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
