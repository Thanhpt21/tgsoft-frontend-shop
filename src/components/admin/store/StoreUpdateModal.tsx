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
import { useUpdateStore } from '@/hooks/store/useUpdateStore';
import { Store } from '@/types/store.type';

interface StoreUpdateModalProps {
  open: boolean;
  onClose: () => void;
  store: Store | null;
  refetch?: () => void;
}

export const StoreUpdateModal = ({ open, onClose, store, refetch }: StoreUpdateModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const { mutateAsync, isPending } = useUpdateStore();

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

  useEffect(() => {
    if (store && open) {
      form.setFieldsValue({
        name: store.name,
        address: store.address,
        mobile: store.mobile,
        link: store.link,
        iframe: store.iframe,
      });
      setFileList(
        store.image
          ? [{ uid: '-1', name: 'image.jpg', status: 'done', url: store.image }]
          : []
      );
    } else if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [store, open, form]);

  const onFinish = async (values: Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'image'>) => {
    try {
      if (!store) return;
      const file = fileList?.[0]?.originFileObj;
      const payload = { ...values } as any;
      if (file) {
        payload.file = file;
      }
      await mutateAsync({ id: store.id, data: payload });
      message.success('Cập nhật cửa hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật cửa hàng');
    }
  };

  return (
    <Modal title="Cập nhật cửa hàng" visible={open} onCancel={onClose} footer={null} destroyOnClose>
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};