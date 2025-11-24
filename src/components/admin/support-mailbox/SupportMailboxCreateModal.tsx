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
import { getStatusLabel } from './support-mailbox.utils'
import { SupportStatus } from '@/enums/support-mailbox.enums'
import { useCreateSupportMailbox } from '@/hooks/support-mailbox/useCreateSupportMailbox'


const { TextArea } = Input
const { Option } = Select

interface SupportMailboxCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const SupportMailboxCreateModal = ({ open, onClose, refetch }: SupportMailboxCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useCreateSupportMailbox()

  const onFinish = async (values: any) => {
    try {
      const formData = {
        title: values.title,
        description: values.description || '',
        images: fileList.length > 0 ? {
          files: fileList.map(file => ({
            name: file.name,
            url: file.thumbUrl || URL.createObjectURL(file.originFileObj!)
          }))
        } : undefined,
        status: values.status || SupportStatus.PENDING,
      }

      await mutateAsync(formData)
      message.success('Tạo yêu cầu hỗ trợ thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo yêu cầu hỗ trợ')
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
      title="Tạo yêu cầu hỗ trợ mới" 
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
          <Input placeholder="Ví dụ: Lỗi thanh toán không hoạt động" />
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          name="description"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..." 
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          initialValue={SupportStatus.PENDING}
        >
          <Select>
            <Option value={SupportStatus.PENDING}>{getStatusLabel(SupportStatus.PENDING)}</Option>
          
          </Select>
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
            Tạo yêu cầu hỗ trợ
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}