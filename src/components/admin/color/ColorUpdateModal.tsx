'use client'

import { useUpdateColor } from '@/hooks/color/useUpdateColor'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface ColorUpdateModalProps {
  open: boolean
  onClose: () => void
  color: { id: number; title: string; code: string } | null
  refetch?: () => void
}

export const ColorUpdateModal = ({ open, onClose, color, refetch }: ColorUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateColor()

  useEffect(() => {
    if (color && open) {
      form.setFieldsValue({
        title: color.title,
        code: color.code,
      })
    } else {
      form.resetFields()
    }
  }, [color, open, form])

  const onFinish = async (values: any) => {
    try {
      if (!color) return
      await mutateAsync({ id: color.id, data: values }) // data: {title, code}
      message.success('Cập nhật màu thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật màu')
    }
  }

  return (
    <Modal
      title="Cập nhật màu"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
