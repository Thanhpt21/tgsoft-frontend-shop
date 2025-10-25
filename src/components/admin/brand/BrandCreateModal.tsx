'use client'

import { Modal, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCreateBrand } from '@/hooks/brand/useCreateBrand'
import type { UploadFile } from 'antd/es/upload/interface'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'

interface BrandCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const BrandCreateModal = ({ open, onClose, refetch }: BrandCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useCreateBrand()



  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')

      const file = fileList?.[0]?.originFileObj
      if (file) {
        formData.append('thumb', file)
      }

      await mutateAsync(formData)
      message.success('Tạo thương hiệu thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo thương hiệu')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open, form])

  return (
    <Modal 
      title="Tạo thương hiệu mới" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên thương hiệu"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thương hiệu' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input placeholder="Ví dụ: Nike" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Vui lòng nhập slug' },
            { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
          ]}
        >
          <Input placeholder="Ví dụ: nike" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả về thương hiệu..." />
        </Form.Item>

        <Form.Item label="Hình ảnh" tooltip="Chấp nhận JPEG, PNG, JPG, WEBP. Tối đa 5MB">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
            maxCount={1}
            accept={ACCEPTED_IMAGE_TYPES}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
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