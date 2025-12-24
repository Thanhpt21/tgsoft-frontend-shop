'use client'

import { Modal, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState, useCallback } from 'react'
import { useCreateCategory } from '@/hooks/category/useCreateCategory'
import type { UploadFile } from 'antd/es/upload/interface'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'

interface CategoryCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

// Hàm chuyển đổi tiêu đề thành slug (giống với ProductCreateModal)
const convertToSlug = (text: string): string => {
  return text
    .toLowerCase() // Chuyển thành chữ thường
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/[đĐ]/g, 'd') // Chuyển đ/Đ thành d
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
    .trim() // Xóa khoảng trắng đầu cuối
}

export const CategoryCreateModal = ({ open, onClose, refetch }: CategoryCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useCreateCategory()

  // Xử lý khi nhập tên danh mục - tự động sinh slug
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = convertToSlug(name)
    
    // Cập nhật giá trị slug trong form
    form.setFieldsValue({
      slug: slug
    })
  }, [form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')

      const file = fileList?.[0]?.originFileObj
      if (file) formData.append('thumb', file)

      await mutateAsync(formData)
      message.success('Tạo danh mục thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo danh mục')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open, form])

  return (
    <Modal title="Tạo danh mục mới" open={open} onCancel={onClose} footer={null} destroyOnClose width={600}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục' },
            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
            { max: 100, message: 'Tên danh mục không được vượt quá 100 ký tự' }
          ]}
        >
          <Input 
            placeholder="Nhập tên danh mục"
            onChange={handleNameChange}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Vui lòng nhập slug' },
            { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
            { min: 2, message: 'Slug phải có ít nhất 2 ký tự' },
            { max: 100, message: 'Slug không được vượt quá 100 ký tự' }
          ]}
          extra="Slug sẽ tự động được tạo từ tên danh mục"
        >
          <Input 
            placeholder="slug-tu-dong-tao"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item 
          label="Mô tả" 
          name="description"
          rules={[
            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
          ]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
            showCount 
            maxLength={500}
          />
        </Form.Item>

        <Form.Item 
          label="Hình ảnh đại diện"
          extra={
            <div className="text-xs text-gray-500 mt-1">
              Hỗ trợ: {ACCEPTED_IMAGE_TYPES}, tối đa {MAX_IMAGE_SIZE_MB}MB
            </div>
          }
        >
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