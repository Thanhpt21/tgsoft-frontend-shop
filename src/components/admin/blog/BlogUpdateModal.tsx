'use client'

import { Modal, Form, Input, Button, Upload, message, Switch } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useUpdateBlog } from '@/hooks/blog/useUpdateBlog'
import { Blog } from '@/types/blog.type'
import { getImageUrl } from '@/utils/getImageUrl'

const DynamicRichTextEditor = dynamic(() => import('@/components/common/RichTextEditor'), { ssr: false })

interface ContentItem {
  title: string
  body: string
}

interface BlogUpdateModalProps {
  open: boolean
  onClose: () => void
  blog: Blog | null
  refetch?: () => void
}

export const BlogUpdateModal = ({ open, onClose, blog, refetch }: BlogUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateBlog()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [fileList, setFileList] = useState<any[]>([])

  // Sync form when blog changes
  useEffect(() => {
    if (blog && open) {
      form.setFieldsValue({
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        isPublished: blog.isPublished,
      });

      // Nếu blog.content là string JSON, parse trước khi set state
      try {
        const parsedContent = typeof blog.content === 'string' ? JSON.parse(blog.content) : blog.content;
        setContentItems(Array.isArray(parsedContent) ? parsedContent : []);
      } catch {
        setContentItems([]);
      }

      setFileList(
        blog.thumb
          ? [
              {
                uid: '-1',
                name: 'thumbnail',
                status: 'done',
                url: getImageUrl(blog.thumb),
              },
            ]
          : []
      );
    } else if (!open) {
      form.resetFields();
      setFileList([]);
      setContentItems([]);
    }
  }, [blog, open, form]);

  // Handle submit
  const onFinish = async (values: any) => {
    try {
      const file = fileList.find((f: any) => f.originFileObj)?.originFileObj
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')
      formData.append('categoryId', values.categoryId)
      formData.append('isPublished', values.isPublished ? 'true' : 'false')
      formData.append('content', JSON.stringify(contentItems))
      if (file) formData.append('thumb', file)

      await mutateAsync({ id: blog!.id, data: formData })
      message.success('Cập nhật blog thành công')
      onClose()
      form.resetFields()
      setFileList([])
      setContentItems([{ title: '', body: '' }])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật blog')
    }
  }

  // Content management
  const handleAddContentItem = () => setContentItems([...contentItems, { title: '', body: '' }])
  const handleRemoveContentItem = (index: number) =>
    setContentItems(contentItems.filter((_, i) => i !== index))
  const handleContentItemChange = (index: number, name: 'title' | 'body', value: string) => {
    const newItems = [...contentItems]
    newItems[index][name] = value
    setContentItems(newItems)
  }

  const handleThumbChange = ({ fileList: newFileList }: any) => setFileList(newFileList)

  return (
    <Modal
      title="Cập nhật Blog"
      visible={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Thumbnail */}
        <Form.Item label="Ảnh Thumbnail">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleThumbChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        {/* Title */}
        <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input />
        </Form.Item>

        {/* Slug */}
        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Vui lòng nhập slug' },
            { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
          ]}
        >
          <Input placeholder="ví dụ: tin-tuc-moi" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Mô tả ngắn" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

    

        {/* Dynamic content */}
        <Form.Item label="Nội dung">
          {contentItems.map((item, index) => (
            <div key={index} style={{ marginBottom: 24, border: '1px solid #f0f0f0', padding: 16, borderRadius: 6 }}>
              <h3>Phần tử #{index + 1}</h3>
              <Form.Item label="Tiêu đề phần tử">
                <Input value={item.title} onChange={(e) => handleContentItemChange(index, 'title', e.target.value)} />
              </Form.Item>
              <Form.Item label="Nội dung">
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
                  <DynamicRichTextEditor
                    value={item.body}
                    onChange={(value) => handleContentItemChange(index, 'body', value)}
                    height={300}
                  />
                </div>
              </Form.Item>
              {contentItems.length > 1 && (
                <Button danger onClick={() => handleRemoveContentItem(index)}>Xóa phần tử này</Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={handleAddContentItem} block>
            Thêm phần tử nội dung
          </Button>
        </Form.Item>

        {/* Published switch */}
        <Form.Item label="Trạng thái xuất bản" name="isPublished" valuePropName="checked">
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
