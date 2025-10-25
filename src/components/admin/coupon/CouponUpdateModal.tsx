'use client';

import { useUpdateCoupon } from '@/hooks/coupon/useUpdateCoupon';
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

interface CouponUpdateModalProps {
  open: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  refetch?: () => void;
}

interface UpdateCouponForm {
  title?: string;
  code?: string;
  discount?: number;
  expiresAt?: Dayjs;
  usageLimit?: number;
  minOrderValue?: number;
}

export const CouponUpdateModal = ({ open, onClose, coupon, refetch }: CouponUpdateModalProps) => {
  const [form] = Form.useForm<UpdateCouponForm>();
  const { mutateAsync, isPending } = useUpdateCoupon();

  useEffect(() => {
    if (coupon && open) {
      form.setFieldsValue({
        title: coupon.title,
        code: coupon.code,
        discount: coupon.discount,
        expiresAt: dayjs(coupon.expiresAt),
        usageLimit: coupon.usageLimit,
        minOrderValue: coupon.minOrderValue,
      });
    } else {
      form.resetFields();
    }
  }, [coupon, open, form]);

    const onFinish = async (values: UpdateCouponForm) => {
    try {
        if (!coupon) return;
        const payload: Partial<Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount' | 'Order'>> = {};

        if (values.title !== undefined) {
        payload.title = values.title;
        }
        if (values.code !== undefined) {
        payload.code = values.code;
        }
        if (values.discount !== undefined) {
        payload.discount = values.discount;
        }
        if (values.expiresAt !== undefined) {
        payload.expiresAt = values.expiresAt.toISOString();
        }
        if (values.usageLimit !== undefined) {
        payload.usageLimit = values.usageLimit;
        }
        if (values.minOrderValue !== undefined) {
        payload.minOrderValue = values.minOrderValue;
        }

        await mutateAsync({ id: coupon.id, data: payload as Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount' | 'Order'> });
        message.success('Cập nhật mã giảm giá thành công');
        onClose();
        form.resetFields();
        refetch?.();
    } catch (err: any) {
        message.error(err?.response?.data?.message || 'Lỗi cập nhật mã giảm giá');
    }
    };

  return (
    <Modal
      title="Cập nhật mã giảm giá"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};