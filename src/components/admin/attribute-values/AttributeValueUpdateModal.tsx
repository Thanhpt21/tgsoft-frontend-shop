'use client'

import { Modal, Form, Input, Button, message } from 'antd'
import { useEffect } from 'react'
import { useUpdateAttributeValue } from '@/hooks/attribute-value/useUpdateAttributeValue'

interface AttributeValueUpdateModalProps {
  open: boolean
  onClose: () => void
  attributeValue: any
  refetch?: () => void
}

export const AttributeValueUpdateModal = ({
  open,
  onClose,
  attributeValue,
  refetch,
}: AttributeValueUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateAttributeValue()

  useEffect(() => {
    if (attributeValue && open) {
      form.setFieldsValue({ value: attributeValue.value })
    }
  }, [attributeValue, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({ id: attributeValue.id, data: values })
      message.success('Cập nhật giá trị thành công')
      onClose()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật')
    }
  }

  return (
    <Modal
      title="Cập nhật giá trị thuộc tính"
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
          <Input placeholder="Nhập giá trị mới..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
