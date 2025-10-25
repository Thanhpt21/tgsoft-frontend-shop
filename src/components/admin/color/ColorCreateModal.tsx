'use client'

import { useCreateColor } from '@/hooks/color/useCreateColor'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface ColorCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const ColorCreateModal = ({ open, onClose, refetch }: ColorCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateColor()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values) // { title, code }
      message.success('Tạo màu thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo màu')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open])

  return (
    <Modal
      title="Tạo màu"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên màu"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã màu (code)"
          name="code"
          rules={[{ required: true, message: 'Vui lòng chọn mã màu' }]}
        >
          <Input type="color" style={{ width: 80, height: 40, padding: 0, border: 'none' }} />
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
