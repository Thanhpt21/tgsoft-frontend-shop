'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateRole } from '@/hooks/role/useCreateRole'

interface RoleCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const RoleCreateModal = ({
  open,
  onClose,
  refetch,
}: RoleCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateRole()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo vai trò thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo vai trò')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo vai trò mới"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên vai trò"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên vai trò' },
            { min: 2, message: 'Tên vai trò phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên vai trò (VD: admin, manager, staff)" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập mô tả vai trò (không bắt buộc)"
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