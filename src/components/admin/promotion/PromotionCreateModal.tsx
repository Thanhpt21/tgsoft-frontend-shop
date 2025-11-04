'use client'

import { Modal, Form, Input, Button, DatePicker, Select, message, Checkbox } from 'antd'
import { useEffect, useState } from 'react'
import { useCreatePromotion } from '@/hooks/promotion/useCreatePromotion'
import { PromotionStatus } from '@/types/promotion.type'  // Import enum PromotionStatus

interface PromotionCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const PromotionCreateModal = ({ open, onClose, refetch }: PromotionCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreatePromotion()

  const handleFinish = async (values: any) => {
    try {
      const formData = {
        name: values.name,
        description: values.description || '',
        startTime: values.startTime?.toISOString(),
        endTime: values.endTime?.toISOString(),
        status: values.status, // Trạng thái sẽ có 4 giá trị: DRAFT, SCHEDULED, ACTIVE, ENDED
        isFlashSale: values.isFlashSale || false,
      }

      await mutateAsync(formData)
      message.success('Tạo chương trình khuyến mãi thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo chương trình khuyến mãi')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo chương trình khuyến mãi"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tên chương trình"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}>
          <Input placeholder="Ví dụ: Flash Sale 50% Off" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description">
          <Input.TextArea rows={3} placeholder="Mô tả về chương trình..." />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu"
          name="startTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}>
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Chọn ngày bắt đầu"
          />
        </Form.Item>

        <Form.Item
          label="Ngày kết thúc"
          name="endTime"
          rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}>
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Chọn ngày kết thúc"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
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
            Tạo chương trình
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
