'use client'

import { Modal, Form, Input, Button, Upload, Select, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

import type { UploadFile } from 'antd/es/upload/interface'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'
import { SupportMailbox } from '@/types/support-mailbox.types'
import { useUpdateSupportMailbox } from '@/hooks/support-mailbox/useUpdateSupportMailbox'
import { getStatusLabel } from './support-mailbox.utils'
import { SupportStatus } from '@/enums/support-mailbox.enums'


const { TextArea } = Input
const { Option } = Select

interface SupportMailboxUpdateModalProps {
  open: boolean
  onClose: () => void
  ticket: SupportMailbox | null
  refetch?: () => void
}

export const SupportMailboxUpdateModal = ({ open, onClose, ticket, refetch }: SupportMailboxUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useUpdateSupportMailbox()

  useEffect(() => {
    if (ticket && open) {
      form.setFieldsValue({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        shopReply: ticket.shopReply || '',
      })

      // Xử lý hiển thị images nếu có
      if (ticket.images && Array.isArray(ticket.images.files)) {
        const files = ticket.images.files.map((file: any, index: number) => ({
          uid: `-${index + 1}`,
          name: file.name || `image-${index + 1}.jpg`,
          status: 'done' as const,
          url: file.url,
        }))
        setFileList(files)
      } else {
        setFileList([])
      }
    }
  }, [ticket, open, form])

  const onFinish = async (values: any) => {
    if (!ticket) return

    try {
      const formData = {
        title: values.title,
        description: values.description || '',
        images: fileList.length > 0 ? {
          files: fileList.map(file => ({
            name: file.name,
            url: file.url || (file.thumbUrl || URL.createObjectURL(file.originFileObj!))
          }))
        } : undefined,
        status: values.status,
        shopReply: values.shopReply || undefined,
      }

      await mutateAsync({ id: ticket.id, data: formData })
      message.success('Cập nhật yêu cầu hỗ trợ thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật yêu cầu hỗ trợ')
    }
  }

  return (
    <Modal 
      title="Cập nhật yêu cầu hỗ trợ" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          name="description"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select>
            <Option value={SupportStatus.PENDING}>{getStatusLabel(SupportStatus.PENDING)}</Option>
            <Option value={SupportStatus.IN_PROGRESS}>{getStatusLabel(SupportStatus.IN_PROGRESS)}</Option>
            <Option value={SupportStatus.RESOLVED}>{getStatusLabel(SupportStatus.RESOLVED)}</Option>
            <Option value={SupportStatus.CLOSED}>{getStatusLabel(SupportStatus.CLOSED)}</Option>
            <Option value={SupportStatus.CANCELLED}>{getStatusLabel(SupportStatus.CANCELLED)}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Phản hồi từ shop"
          name="shopReply"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập phản hồi từ shop (nếu có)..." 
          />
        </Form.Item>

        <Form.Item 
          label="Hình ảnh đính kèm" 
          tooltip="Chấp nhận JPEG, PNG, JPG, WEBP. Tối đa 5MB"
        >
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
            maxCount={5}
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
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