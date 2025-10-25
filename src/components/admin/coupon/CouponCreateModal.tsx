'use client';

import { useCreateCoupon } from '@/hooks/coupon/useCreateCoupon';
import {
  Modal,
  Form,
  Input,
  message,
  Button,
  InputNumber,
  DatePicker,
} from 'antd';
import { useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

interface CouponCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

interface CreateCouponForm {
  title: string;
  code: string;
  discount: number;
  expiresAt: Dayjs;
  usageLimit: number;
  minOrderValue: number;
}

export const CouponCreateModal = ({ open, onClose, refetch }: CouponCreateModalProps) => {
  const [form] = Form.useForm<CreateCouponForm>();
  const { mutateAsync, isPending } = useCreateCoupon();

  const onFinish = async (values: CreateCouponForm) => {
    try {
      const payload = {
        ...values,
        expiresAt: values.expiresAt.toISOString(),
        minOrderValue: values.minOrderValue !== undefined ? values.minOrderValue : 0, // Đặt mặc định là 0 nếu không có giá trị
      };
      await mutateAsync(payload);
      message.success('Tạo mã giảm giá thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo mã giảm giá');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Tạo mã giảm giá"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã"
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giảm giá (đ)"
          name="discount"
          rules={[{ required: true, message: 'Vui lòng nhập mức giảm giá' }]}
        >
         <InputNumber
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Ngày hết hạn"
          name="expiresAt"
          rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Giới hạn sử dụng"
          name="usageLimit"
          rules={[{ required: true, message: 'Vui lòng nhập giới hạn sử dụng' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

       <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderValue" rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};