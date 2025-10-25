'use client'

import { Modal, Form, Input, message, Button } from 'antd'
import { useEffect } from 'react'
import { useUpdatePermission } from '@/hooks/permission/useUpdatePermission'

interface PermissionUpdateModalProps {
  open: boolean
  onClose: () => void
  permission: any
  refetch?: () => void
}

export const PermissionUpdateModal = ({
  open,
  onClose,
  permission,
  refetch,
}: PermissionUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdatePermission()

  useEffect(() => {
    if (permission && open) {
      form.setFieldsValue({
        name: permission.name,
        description: permission.description,
      })
    }
  }, [permission, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: permission.id,
        data: values,
      })
      message.success('Cập nhật quyền thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật quyền')
    }
  }

  return (
    <Modal
      title="Cập nhật quyền"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}