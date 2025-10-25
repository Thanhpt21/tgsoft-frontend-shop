'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreatePermission } from '@/hooks/permission/useCreatePermission'

interface PermissionCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const PermissionCreateModal = ({
  open,
  onClose,
  refetch,
}: PermissionCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreatePermission()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo quyền thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo quyền')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo quyền mới"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên quyền"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên quyền' },
            { min: 3, message: 'Tên quyền phải có ít nhất 3 ký tự' },
          ]}
          extra="VD: create_product, edit_order, view_users"
        >
          <Input placeholder="Nhập tên quyền (VD: create_product)" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập mô tả quyền (không bắt buộc)"
          />
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