'use client'

import { Modal, Form, Input, Button, Upload, message, Switch } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useCreateBlog } from '@/hooks/blog/useCreateBlog'
import type { UploadFile } from 'antd/es/upload/interface'
import DynamicRichTextEditor from '@/components/common/RichTextEditor'

interface ContentItem {
  title: string
  body: string
}

interface BlogCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const BlogCreateModal = ({ open, onClose, refetch }: BlogCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateBlog()
  const [contentItems, setContentItems] = useState<ContentItem[]>([{ title: '', body: '' }])
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleAddContentItem = () => setContentItems([...contentItems, { title: '', body: '' }])
  const handleRemoveContentItem = (index: number) => setContentItems(contentItems.filter((_, i) => i !== index))
  const handleContentItemChange = (index: number, name: 'title' | 'body', value: string) => {
    const newItems = [...contentItems]
    newItems[index][name] = value
    setContentItems(newItems)
  }

  const handleFileChange = ({ fileList: newFileList }: any) => setFileList(newFileList)

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('slug', values.slug)
      formData.append('description', values.description)
      if (fileList[0]?.originFileObj) formData.append('thumb', fileList[0].originFileObj)
      formData.append('isPublished', values.isPublished ? 'true' : 'false')
      formData.append('content', JSON.stringify(contentItems))

      await mutateAsync(formData)
      message.success('Tạo blog thành công')
      onClose()
      form.resetFields()
      setFileList([])
      setContentItems([{ title: '', body: '' }])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Tạo blog thất bại')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
      setContentItems([{ title: '', body: '' }])
    }
  }, [open])

  return (
    <Modal
      title="Tạo Blog"
      visible={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Thumbnail */}
        <Form.Item label="Ảnh thumbnail">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        {/* Tiêu đề */}
        <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
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
          <Input placeholder="ví dụ: tin-tuc-moi" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả" name="description">
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
                <Button danger onClick={() => handleRemoveContentItem(index)}>
                  Xóa phần tử này
                </Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={handleAddContentItem} block>
            Thêm phần tử nội dung
          </Button>
        </Form.Item>

        {/* Trạng thái xuất bản */}
        <Form.Item label="Xuất bản" name="isPublished" valuePropName="checked" initialValue={false}>
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
