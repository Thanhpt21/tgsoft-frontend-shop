'use client';

import { useCurrent } from '@/hooks/auth/useCurrent';
import { useUpdateUser } from '@/hooks/user/useUpdateUser';
import { Form, Input, Button, message, Upload, Radio } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
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
      return;
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (isError || !currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-red-50 rounded-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-800 font-semibold">Lỗi khi tải thông tin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h2>
        <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {fileList.length > 0 && fileList[0].url ? (
                <div className="relative">
                  <img
                    src={fileList[0].url}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <UploadOutlined className="text-white text-2xl" />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
                  <UserOutlined className="text-white text-5xl" />
                </div>
              )}
            </div>

            <div className="flex justify-center w-full">
              <Upload
                listType="picture"
                fileList={fileList}
                onChange={handleImageChange}
                beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
                maxCount={1}
                accept={ACCEPTED_IMAGE_TYPES}
                showUploadList={false}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-700 font-medium px-6 py-2 h-auto rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {fileList.length > 0 ? 'Thay đổi ảnh đại diện' : 'Tải lên ảnh đại diện'}
                </Button>
              </Upload>
            </div>

            <p className="text-sm text-gray-500 text-center">
              JPG, PNG hoặc GIF (tối đa {MAX_IMAGE_SIZE_MB}MB)
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <Form.Item
            label={<span className="text-gray-700 font-semibold">Họ và tên</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập họ và tên"
              className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>

          {/* Email Field */}
          <Form.Item
            label={<span className="text-gray-700 font-semibold">Email</span>}
            name="email"
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              disabled
              className="h-12 rounded-lg bg-gray-50 border-gray-300"
            />
          </Form.Item>

          {/* Phone Field */}
          <Form.Item
            label={<span className="text-gray-700 font-semibold">Số điện thoại</span>}
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Nhập số điện thoại"
              className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>

          {/* Gender Field */}
          <Form.Item
            label={<span className="text-gray-700 font-semibold">Giới tính</span>}
            name="gender"
          >
            <Radio.Group className="w-full">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12">
                  <Radio.Button value="male" className="!h-12 !flex !items-center !justify-center !rounded-lg !border-2 !w-full">
                    Nam
                  </Radio.Button>
                </div>
                <div className="h-12">
                  <Radio.Button value="female" className="!h-12 !flex !items-center !justify-center !rounded-lg !border-2 !w-full">
                    Nữ
                  </Radio.Button>
                </div>
                <div className="h-12">
                  <Radio.Button value="other" className="!h-12 !flex !items-center !justify-center !rounded-lg !border-2 !w-full">
                    Khác
                  </Radio.Button>
                </div>
                <div className="h-12">
                  <Radio.Button value={null} className="!h-12 !flex !items-center !justify-center !rounded-lg !border-2 !w-full">
                    Không xác định
                  </Radio.Button>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              className="w-full md:w-auto h-12 px-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </Button>
          </Form.Item>
        </div>
      </Form>

      <style jsx global>{`
        .ant-form-item-label > label {
          font-weight: 600;
          color: #374151;
        }

        .ant-input:hover,
        .ant-input:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .ant-radio-button-wrapper {
          height: 48px !important;
          border-radius: 0.5rem !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .ant-radio-button-wrapper::before {
          display: none !important;
        }

        .ant-radio-button-wrapper:not(:first-child)::before {
          display: none !important;
        }

        .ant-radio-button-wrapper:hover {
          border-color: #3b82f6 !important;
        }

        .ant-radio-button-wrapper-checked {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }

        .ant-radio-button-wrapper-checked:hover {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
        }

        .ant-radio-group {
          display: block !important;
        }

        .ant-upload-list-picture .ant-upload-list-item {
          border-radius: 0.75rem;
          border: 2px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default PersonalInfo;