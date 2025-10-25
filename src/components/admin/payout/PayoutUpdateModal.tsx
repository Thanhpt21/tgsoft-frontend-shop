'use client'

import { Modal, Form, Input, InputNumber, Button, Select, message } from 'antd'
import { useEffect } from 'react'
import { useUpdatePayout } from '@/hooks/payout/useUpdatePayout'

interface PayoutUpdateModalProps {
  open: boolean
  onClose: () => void
  payout: any
  refetch?: () => void
}

export const PayoutUpdateModal = ({ open, onClose, payout, refetch }: PayoutUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdatePayout()

  useEffect(() => {
    if (payout && open) {
      form.setFieldsValue(payout)
    }
  }, [payout, open, form])

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({ id: payout.id, data: values })
      message.success('Cập nhật phiếu chi thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật phiếu chi')
    }
  }

  return (
    <Modal
      title="Cập nhật phiếu chi"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Trạng thái" name="status">
          <Select
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Failed', value: 'FAILED' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Phương thức" name="method">
          <Input />
        </Form.Item>

        <Form.Item label="Mã tham chiếu" name="reference">
          <Input />
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
