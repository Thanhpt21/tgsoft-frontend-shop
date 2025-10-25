'use client';

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCreateStore } from '@/hooks/store/useCreateStore';
import { Store } from '@/types/store.type';

interface StoreCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const StoreCreateModal = ({ open, onClose, refetch }: StoreCreateModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const { mutateAsync, isPending } = useCreateStore();

  const validateMobile = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    const phoneRegex = /^(0[2-9]\d{8,9}|[+]84[2-9]\d{8,9})$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject('Số điện thoại không hợp lệ');
    }
    return Promise.resolve();
  };

  const onFinish = async (values: Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'image'>) => {
    try {
      const file = fileList?.[0]?.originFileObj;
      const payload = { ...values } as any;
      if (file) {
        payload.file = file;
      }
      await mutateAsync(payload);
      message.success('Tạo cửa hàng thành công');
      onClose();
      form.resetFields();
      setFileList([]);
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo cửa hàng');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  return (
    <Modal title="Tạo cửa hàng" visible={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên cửa hàng"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="mobile"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { validator: validateMobile },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Link"
          name="link"
          rules={[{ required: true, message: 'Vui lòng nhập link' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Iframe"
          name="iframe"
          rules={[{ required: true, message: 'Vui lòng nhúng iframe' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
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