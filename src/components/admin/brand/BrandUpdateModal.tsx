'use client'

import { Modal, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateBrand } from '@/hooks/brand/useUpdateBrand'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'
import { getImageUrl } from '@/utils/getImageUrl'

interface BrandUpdateModalProps {
  open: boolean
  onClose: () => void
  brand: any
  refetch?: () => void
}

export const BrandUpdateModal = ({ open, onClose, brand, refetch }: BrandUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateBrand()

  useEffect(() => {
    if (brand && open) {
      form.setFieldsValue({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
      })
      if (brand.thumb) {
        setFileList([
          {
            uid: '-1',
            name: brand.thumb.split('/').pop() || 'thumb.png',
            status: 'done',
            url: getImageUrl(brand.thumb),
          },
        ])
      }
    }
  }, [brand, open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')

      const file = fileList?.[0]?.originFileObj
      if (file) formData.append('thumb', file) // ⭐ Sửa từ 'file' thành 'thumb'

      await mutateAsync({ id: brand.id, data: formData })
      message.success('Cập nhật thương hiệu thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật thương hiệu')
    }
  }

  return (
    <Modal title="Cập nhật thương hiệu" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên thương hiệu"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
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
