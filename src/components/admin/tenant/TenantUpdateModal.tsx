'use client'

import { Modal, Form, Input, Switch, message, Button } from 'antd'
import { useEffect } from 'react'
import { useUpdateTenant } from '@/hooks/tenant/useUpdateTenant'

interface TenantUpdateModalProps {
  open: boolean
  onClose: () => void
  tenant: any
  refetch?: () => void
}

export const TenantUpdateModal = ({
  open,
  onClose,
  tenant,
  refetch,
}: TenantUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateTenant()

  useEffect(() => {
    if (tenant && open) {
      form.setFieldsValue({
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
      })
    }
  }, [tenant, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: tenant.id,
        data: values,
      })
      message.success('Cập nhật cửa hàng thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật cửa hàng')
    }
  }

  return (
    <Modal
      title="Cập nhật cửa hàng"
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
        >
          <Switch />
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