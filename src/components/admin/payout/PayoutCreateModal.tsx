'use client'

import { Modal, Form, Input, InputNumber, Button, Select, message } from 'antd'
import { useEffect } from 'react'
import { useCreatePayout } from '@/hooks/payout/useCreatePayout'

interface PayoutCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const PayoutCreateModal = ({ open, onClose, refetch }: PayoutCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreatePayout()

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values)
      message.success('Tạo phiếu chi thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo phiếu chi')
    }
  }

  useEffect(() => {
    if (!open) form.resetFields()
  }, [open, form])

  return (
    <Modal
      title="Tạo phiếu chi mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Loại người nhận"
          name="receiverType"
          rules={[{ required: true, message: 'Vui lòng chọn loại người nhận' }]}
        >
          <Select
            options={[
              { label: 'User', value: 'USER' },
              { label: 'Distributor', value: 'DISTRIBUTOR' },
              { label: 'Affiliate', value: 'AFFILIATE' },
            ]}
          />
        </Form.Item>

        <Form.Item label="ID người nhận" name="receiverId">
          <InputNumber min={1} placeholder="Nhập ID người nhận (tùy chọn)" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Số tiền"
          name="amount"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <InputNumber
            min={0}
            className="w-full"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        <Form.Item label="Phương thức thanh toán" name="method">
          <Input placeholder="Ví dụ: Chuyển khoản ngân hàng" />
        </Form.Item>

        <Form.Item label="Mã tham chiếu" name="reference">
          <Input placeholder="Thêm ghi chú hoặc mã giao dịch..." />
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
