'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useUpdateRole } from '@/hooks/role/useUpdateRole'

interface RoleUpdateModalProps {
  open: boolean
  onClose: () => void
  role: any
  refetch?: () => void
}

export const RoleUpdateModal = ({
  open,
  onClose,
  role,
  refetch,
}: RoleUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateRole()

  useEffect(() => {
    if (role && open) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
      })
    }
  }, [role, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: role.id,
        data: values,
      })
      message.success('Cập nhật vai trò thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật vai trò')
    }
  }

  return (
    <Modal
      title="Cập nhật vai trò"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}