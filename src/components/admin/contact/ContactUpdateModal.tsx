'use client'; // Báo hiệu đây là một Client Component trong Next.js

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select, // Thêm Select cho status và type
  Button,
  message,
} from 'antd';
import { useUpdateContact } from '@/hooks/contact/useUpdateContact'; // Import hook cập nhật liên hệ
import { Contact, UpdateContactPayload } from '@/types/contact.type'; // Import Contact và UpdateContactPayload
import { ContactStatus, ContactType } from '@/enums/contact.enums'

interface ContactUpdateModalProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null; // Dữ liệu contact cần cập nhật (hoặc null nếu không có)
  refetch?: () => void; // Hàm tùy chọn để refetch dữ liệu ở component cha
}

const { Option } = Select; // Destructure Option từ Select
const { TextArea } = Input; // Destructure TextArea từ Input

export const ContactUpdateModal: React.FC<ContactUpdateModalProps> = ({ open, onClose, contact, refetch }) => {
  const [form] = Form.useForm(); // Sử dụng Ant Design Form hook
  const { mutateAsync: updateContact, isPending } = useUpdateContact(); // Lấy mutation và loading state từ hook

  // useEffect để thiết lập giá trị form khi modal mở hoặc dữ liệu contact thay đổi
  useEffect(() => {
    if (contact && open) {
      // Khi có dữ liệu contact và modal đang mở, đặt giá trị cho form
      form.setFieldsValue({
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile, // Có thể null/undefined
        comment: contact.comment,
        status: contact.status,
        type: contact.type,
      });
    } else {
      // Khi modal đóng hoặc không có contact, reset form
      form.resetFields();
    }
  }, [contact, open, form]);

  // Hàm xử lý khi form được submit
  const onFinish = async (values: UpdateContactPayload) => {
    try {
      if (!contact) {
        message.error('Không tìm thấy thông tin liên hệ để cập nhật.');
        return;
      }
      // Gọi mutation để cập nhật liên hệ
      await updateContact({ id: contact.id, data: values }); // Truyền id và payload (values)

      message.success('Cập nhật liên hệ thành công!');
      onClose(); // Đóng modal
      form.resetFields(); // Reset form
      refetch?.(); // Nếu refetch được cung cấp, gọi nó để làm mới dữ liệu bảng
    } catch (err: any) {
      // Xử lý lỗi từ API hoặc lỗi khác
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật liên hệ.');
    }
  };

  return (
    <Modal
      title="Cập nhật liên hệ"
      visible={open} // Sử dụng 'open' thay vì 'visible' cho Ant Design v5+
      onCancel={onClose}
      footer={null} // Không dùng footer mặc định của Modal, sẽ tự định nghĩa nút trong Form.Item
      destroyOnClose // Hủy bỏ trạng thái form khi đóng modal
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên người gửi"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên người gửi!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="mobile"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nội dung"
          name="comment"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select placeholder="Chọn trạng thái">
            {Object.values(ContactStatus).map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Loại liên hệ"
          name="type"
          rules={[{ required: true, message: 'Vui lòng chọn loại liên hệ!' }]}
        >
          <Select placeholder="Chọn loại liên hệ">
            {Object.values(ContactType).map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
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