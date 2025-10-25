'use client'

import { useUpdateSize } from '@/hooks/size/useUpdateSize'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface SizeUpdateModalProps {
  open: boolean
  onClose: () => void
  size: { id: number; title: string } | null
  refetch?: () => void
}

export const SizeUpdateModal = ({ open, onClose, size, refetch }: SizeUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateSize()

  useEffect(() => {
    if (size && open) {
      form.setFieldsValue({
        title: size.title,
      })
    } else {
      form.resetFields()
    }
  }, [size, open, form])

  const onFinish = async (values: any) => {
    try {
      if (!size) return
      await mutateAsync({ id: size.id, data: values }) // data: { title }
      message.success('Cập nhật kích cỡ thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật kích cỡ')
    }
  }

  return (
    <Modal
      title="Cập nhật kích cỡ"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên kích cỡ"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên kích cỡ' }]}
        >
          <Input />
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
