'use client';

import { useCurrent, CurrentUser } from '@/hooks/auth/useCurrent';
import { useUpdateUser } from '@/hooks/user/useUpdateUser';
import { Form, Input, Button, message, Avatar, Upload, Radio, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils';
import { getImageUrl } from '@/utils/getImageUrl';

interface PersonalInfoProps {}

const PersonalInfo = ({}: PersonalInfoProps) => {
  const { data: currentUser, isLoading, isError, refetch: refetchCurrentUser } = useCurrent();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        gender: currentUser.gender || null,
      });
      if (currentUser.avatar) {
        setFileList([
          {
            uid: '-1',
            name: currentUser.avatar.split('/').pop() || 'avatar.png',
            status: 'done',
            url: getImageUrl(currentUser.avatar),
          },
        ]);
      }
    }
  }, [currentUser, form]);

  const handleImageChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const onFinish = async (values: any) => {
    if (!currentUser?.id) {
      message.error('Không tìm thấy ID người dùng.');
      return; // Hoặc có thể trả về tùy theo yêu cầu
    }

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone || '');
      formData.append('gender', values.gender || '');

      const file = fileList?.[0]?.originFileObj;
      if (file) formData.append('avatar', file);

      await updateUser({ id: currentUser.id, data: formData });
      message.success('Cập nhật thông tin thành công!');
      refetchCurrentUser();
    } catch (err: any) {
      message.error('Cập nhật thất bại!');
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError || !currentUser) {
    return <div>Lỗi khi tải thông tin.</div>;
  }

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {},
    onChange: handleImageChange,
    showUploadList: false,
    beforeUpload: createImageUploadValidator(MAX_IMAGE_SIZE_MB),
    maxCount: 1,
    accept: ACCEPTED_IMAGE_TYPES,
  };

  return (
    <div className="container mx-auto">
      <Card title="Cập nhật thông tin cá nhân" bordered={false} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
         <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"  // Sử dụng 'picture-card' để hiển thị ảnh
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
              maxCount={1}
              accept={ACCEPTED_IMAGE_TYPES}
              showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}  // Chỉ hiển thị nút xóa, không hiển thị tên file
            >
              {fileList.length === 0 && (
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Giới tính" name="gender">
            <Radio.Group>
              <Radio value={null}>Không xác định</Radio>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>

        

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isUpdating} block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PersonalInfo;
