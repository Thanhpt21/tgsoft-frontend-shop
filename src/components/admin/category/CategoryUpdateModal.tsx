'use client'

import { Modal, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateCategory } from '@/hooks/category/useUpdateCategory'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'
import type { UploadFile } from 'antd/es/upload/interface'
import { Category } from '@/types/category.type'

interface CategoryUpdateModalProps {
  open: boolean
  onClose: () => void
  category: Category | null
  refetch?: () => void
}

export const CategoryUpdateModal = ({ open, onClose, category, refetch }: CategoryUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useUpdateCategory()

  const getImageUrl = (thumb: string | null) => {
    if (!thumb) return undefined
    if (thumb.startsWith('http')) return thumb
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''
    return `${baseUrl}${thumb}`
  }

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      })
      if (category.thumb) {
        setFileList([
          { uid: '-1', name: category.thumb.split('/').pop() || 'thumb.png', status: 'done', url: getImageUrl(category.thumb) },
        ])
      }
    }
  }, [category, open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')

      const file = fileList?.[0]?.originFileObj
      if (file) formData.append('thumb', file)

      await mutateAsync({ id: category?.id!, data: formData })
      message.success('Cập nhật danh mục thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật danh mục')
    }
  }

  return (
    <Modal title="Cập nhật danh mục" open={open} onCancel={onClose} footer={null} destroyOnClose width={600}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên danh mục" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Vui lòng nhập slug' },
            { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Hình ảnh">
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
