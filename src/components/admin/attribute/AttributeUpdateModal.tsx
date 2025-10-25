'use client'

import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd'
import { useEffect } from 'react'
import { useUpdateAttribute } from '@/hooks/attribute/useUpdateAttribute'
import { AttributeType } from '@/enums/attribute.enums'


interface AttributeUpdateModalProps {
  open: boolean
  onClose: () => void
  attribute: any
  refetch?: () => void
}

export const AttributeUpdateModal = ({
  open,
  onClose,
  attribute,
  refetch,
}: AttributeUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateAttribute()

  useEffect(() => {
    if (attribute && open) {
      form.setFieldsValue({
        name: attribute.name,
        position: attribute.position,
      })
    }
  }, [attribute, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({ id: attribute.id, data: values })
      message.success('Cập nhật thuộc tính thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật thuộc tính')
    }
  }

  return (
    <Modal
      title="Cập nhật thuộc tính"
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
          <Input placeholder="Nhập tên thuộc tính" />
        </Form.Item>

        <Form.Item
          label="Thứ tự hiển thị"
          name="position"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
        >
          <InputNumber min={1} className="w-full" />
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
