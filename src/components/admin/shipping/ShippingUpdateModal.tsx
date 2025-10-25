// src/components/admin/shipping/ShippingUpdateModal.tsx
'use client';

import {
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Button,
} from 'antd';
import { useEffect } from 'react';
import { useUpdateShipping } from '@/hooks/shipping/useUpdateShipping';

interface ShippingUpdateModalProps {
  open: boolean;
  onClose: () => void;
  shipping: any; // Expected to be the Shipping type
  refetch?: () => void;
}

export const ShippingUpdateModal = ({
  open,
  onClose,
  shipping,
  refetch,
}: ShippingUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateShipping();

  useEffect(() => {
    if (shipping && open) {
      form.setFieldsValue({
        provinceName: shipping.provinceName,
        fee: shipping.fee,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [shipping, open, form]);

  const onFinish = async (values: { provinceName?: string; fee?: number }) => {
    try {
      if (!shipping?.id) {
        message.error('Không tìm thấy ID phí vận chuyển để cập nhật.');
        return;
      }
      await mutateAsync({ id: shipping.id, ...values });
      message.success('Cập nhật phí vận chuyển thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật phí vận chuyển');
    }
  };

  return (
    <Modal
      title="Cập nhật phí vận chuyển"
      visible={open}
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};