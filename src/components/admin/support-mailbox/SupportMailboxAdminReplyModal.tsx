'use client'

import { useAdminReplySupportMailbox } from '@/hooks/support-mailbox/useAdminReplySupportMailbox'
import { SupportMailbox } from '@/types/support-mailbox.types'
import { Modal, Form, Input, Button, Select, message } from 'antd'
import { useEffect } from 'react'
import { getStatusLabel } from './support-mailbox.utils'
import { SupportStatus } from '@/enums/support-mailbox.enums'


const { TextArea } = Input
const { Option } = Select

interface SupportMailboxAdminReplyModalProps {
  open: boolean
  onClose: () => void
  ticket: SupportMailbox | null
  refetch?: () => void
}

export const SupportMailboxAdminReplyModal = ({ open, onClose, ticket, refetch }: SupportMailboxAdminReplyModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useAdminReplySupportMailbox()

  useEffect(() => {
    if (ticket && open) {
      form.setFieldsValue({
        status: ticket.status,
      })
    }
  }, [ticket, open, form])

  const onFinish = async (values: any) => {
    if (!ticket) return

    try {
      await mutateAsync({
        id: ticket.id,
        data: {
          adminReply: values.adminReply,
          status: values.status,
        }
      })
      message.success('Đã gửi phản hồi admin thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi gửi phản hồi')
    }
  }

  return (
    <Modal 
      title="Phản hồi từ Admin" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tiêu đề yêu cầu"
        >
          <Input value={ticket?.title} disabled />
        </Form.Item>

        <Form.Item
          label="Mô tả"
        >
          <TextArea 
            value={ticket?.description} 
            rows={3} 
            disabled 
          />
        </Form.Item>

        <Form.Item
          label="Phản hồi của Admin"
          name="adminReply"
          rules={[
            { required: true, message: 'Vui lòng nhập phản hồi' },
            { min: 10, message: 'Phản hồi phải có ít nhất 10 ký tự' },
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Nhập phản hồi chi tiết từ admin..." 
          />
        </Form.Item>

        <Form.Item
          label="Cập nhật trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select>
            <Option value={SupportStatus.IN_PROGRESS}>{getStatusLabel(SupportStatus.IN_PROGRESS)}</Option>
            <Option value={SupportStatus.RESOLVED}>{getStatusLabel(SupportStatus.RESOLVED)}</Option>
            <Option value={SupportStatus.CLOSED}>{getStatusLabel(SupportStatus.CLOSED)}</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Gửi phản hồi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}