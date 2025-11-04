'use client'

import { Modal, Form, Input, Button, DatePicker, Select, message, Checkbox } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdatePromotion } from '@/hooks/promotion/useUpdatePromotion'
import { PromotionStatus } from '@/types/promotion.type'  // Import enum PromotionStatus
import moment from 'moment'

interface PromotionUpdateModalProps {
  open: boolean
  onClose: () => void
  promotion: any
  refetch?: () => void
}

export const PromotionUpdateModal = ({ open, onClose, promotion, refetch }: PromotionUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdatePromotion()

  // Đảm bảo khi modal mở sẽ cập nhật lại các giá trị trong form
  useEffect(() => {
    if (promotion && open) {
      form.setFieldsValue({
        name: promotion.name,
        description: promotion.description || '',
        startTime: promotion.startTime ? moment(promotion.startTime) : null,
        endTime: promotion.endTime ? moment(promotion.endTime) : null,
        status: promotion.status,
        isFlashSale: promotion.isFlashSale,
        
      })
    }
  }, [promotion, open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = {
        name: values.name,
        description: values.description || '',
        startTime: values.startTime?.toISOString(),
        endTime: values.endTime?.toISOString(),
        status: values.status,
        isFlashSale: values.isFlashSale, // Chuyển từ checkbox về true/false
      }

      await mutateAsync({ id: promotion.id, data: formData })
      message.success('Cập nhật chương trình khuyến mãi thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật chương trình khuyến mãi')
    }
  }

  return (
    <Modal
      title="Cập nhật chương trình khuyến mãi"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên chương trình"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu"
          name="startTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Chọn ngày bắt đầu"
          />
        </Form.Item>

        <Form.Item
          label="Ngày kết thúc"
          name="endTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Chọn ngày kết thúc"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái" allowClear>
            {Object.values(PromotionStatus).map(status => (
              <Select.Option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()} {/* Hiển thị trạng thái với chữ cái đầu tiên in hoa */}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

       <Form.Item
        label="Flash Sale"
        name="isFlashSale"
        valuePropName="checked"
        >
        <Checkbox>Flash Sale</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật chương trình
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
