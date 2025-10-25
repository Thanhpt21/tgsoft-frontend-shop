'use client'

import { Modal, Form, Input, InputNumber, Button, Select, message } from 'antd'
import { useEffect } from 'react'
import { useCreateAttribute } from '@/hooks/attribute/useCreateAttribute'
import { AttributeType } from '@/enums/attribute.enums'

interface AttributeCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}


export const AttributeCreateModal = ({
  open,
  onClose,
  refetch,
}: AttributeCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateAttribute()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo thuộc tính thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo thuộc tính')
    }
  }

  useEffect(() => {
    if (!open) form.resetFields()
  }, [open, form])

  return (
    <Modal
      title="Tạo thuộc tính mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên thuộc tính"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thuộc tính' },
            { min: 2, message: 'Tên thuộc tính phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: Màu sắc, Kích thước..." />
        </Form.Item>

        <Form.Item
          label="Thứ tự hiển thị"
          name="position"
          initialValue={1}
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
