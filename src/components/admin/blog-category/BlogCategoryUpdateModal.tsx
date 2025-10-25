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
import { useUpdateBlogCategory } from '@/hooks/blog-category/useUpdateBlogCategory'

interface Props {
  open: boolean
  onClose: () => void
  blogCategory: any
  refetch?: () => void
}

export const BlogCategoryUpdateModal = ({
  open,
  onClose,
  blogCategory,
  refetch,
}: Props) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateBlogCategory()

  useEffect(() => {
    if (blogCategory && open) {
      form.setFieldsValue({
        title: blogCategory.title,
        slug: blogCategory.slug
      })

      setFileList(
        blogCategory.image
          ? [
              {
                uid: '-1',
                name: 'image.jpg',
                status: 'done',
                url: blogCategory.image,
              },
            ]
          : []
      )
    }
  }, [blogCategory, open, form])

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj
       if (!file) {
        message.error('Vui lòng chọn hình ảnh danh mục')
        return
      }
      await mutateAsync({
        id: blogCategory.id,
        data: values,
        file,
      })
      message.success('Cập nhật danh mục blog thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật danh mục blog')
    }
  }

  return (
    <Modal
      title="Cập nhật danh mục blog"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên danh mục" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
         <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
