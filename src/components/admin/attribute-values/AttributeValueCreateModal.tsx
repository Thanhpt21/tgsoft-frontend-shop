'use client'

import { Modal, Form, Input, Button, message } from 'antd'
import { useEffect } from 'react'
import { useCreateAttributeValue } from '@/hooks/attribute-value/useCreateAttributeValue'

interface AttributeValueCreateModalProps {
  open: boolean
  onClose: () => void
  attributeId: number
  refetch?: () => void
}

export const AttributeValueCreateModal = ({
  open,
  onClose,
  attributeId,
  refetch,
}: AttributeValueCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateAttributeValue()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({ attributeId, value: values.value })
      message.success('Thêm giá trị thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo giá trị')
    }
  }

  useEffect(() => {
    if (!open) form.resetFields()
  }, [open, form])

  return (
    <Modal
      title="Thêm giá trị thuộc tính"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Giá trị"
          name="value"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
        >
          <Input placeholder="Nhập giá trị..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
