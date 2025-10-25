'use client'

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCreateBlogCategory } from '@/hooks/blog-category/useCreateBlogCategory'

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const BlogCategoryCreateModal = ({
  open,
  onClose,
  refetch,
}: Props) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useCreateBlogCategory()

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj
      if (!file) {
        message.error('Vui lòng chọn hình ảnh danh mục')
        return
      }
      await mutateAsync({ ...values, file }) // Giống category
      message.success('Tạo danh mục blog thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo danh mục blog')
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
      title="Tạo danh mục blog"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên danh mục"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
