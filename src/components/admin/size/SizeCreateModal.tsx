'use client'

import { useCreateSize } from '@/hooks/size/useCreateSize'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface SizeCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const SizeCreateModal = ({ open, onClose, refetch }: SizeCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateSize()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values) // { title }
      message.success('Tạo kích cỡ thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo kích cỡ')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open])

  return (
    <Modal
      title="Tạo kích cỡ"
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
          <Input placeholder="VD: S, M, L, XL, 36, 37..." />
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
