'use client'

import { Modal, Form, Input, Switch, message, Button } from 'antd'
import { useEffect } from 'react'
import { useCreateTenant } from '@/hooks/tenant/useCreateTenant'

interface TenantCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const TenantCreateModal = ({
  open,
  onClose,
  refetch,
}: TenantCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateTenant()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo cửa hàng thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo cửa hàng')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Tạo cửa hàng mới"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên cửa hàng"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên cửa hàng' },
            { min: 3, message: 'Tên cửa hàng phải có ít nhất 3 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên cửa hàng" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Vui lòng nhập slug' },
            { 
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
              message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' 
            },
          ]}
        >
          <Input placeholder="cua-hang-abc" />
        </Form.Item>

        <Form.Item
          label="Trạng thái hoạt động"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
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