// src/components/admin/shipping/ShippingCreateModal.tsx
'use client';

import {
  Modal,
  Form,
  Input,
  InputNumber, // Import InputNumber for fee
  message,
  Button,
} from 'antd';
import { useEffect } from 'react';
import { useCreateShipping } from '@/hooks/shipping/useCreateShipping'; // Import hook tạo shipping

interface ShippingCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ShippingCreateModal = ({
  open,
  onClose,
  refetch,
}: ShippingCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateShipping();

  const onFinish = async (values: { provinceName: string; fee: number }) => {
    try {
      await mutateAsync(values);
      message.success('Tạo phí vận chuyển thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo phí vận chuyển');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Tạo phí vận chuyển mới"
      visible={open} // Ant Design v5+ uses 'open' instead of 'visible'
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên tỉnh/thành phố"
          name="provinceName"
          rules={[{ required: true, message: 'Vui lòng nhập tên tỉnh/thành phố' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Phí vận chuyển"
          name="fee"
          rules={[{ required: true, message: 'Vui lòng nhập phí vận chuyển' }]}
        >
          <InputNumber
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            style={{ width: '100%' }}
          />
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
  );
};