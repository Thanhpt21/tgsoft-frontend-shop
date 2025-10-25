// app/lien-he/page.tsx
'use client';

import React from 'react';
import { Form, Input, Button, message, Spin, Typography, Card, Space, Tooltip } from 'antd';
import Image from 'next/image';
import { useCreateContact } from '@/hooks/contact/useCreateContact';
import { useConfigOne } from '@/hooks/config/useConfigOne'; // make sure this is imported
import { CreateContactPayload } from '@/types/contact.type';
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';

import ContactBanner from '@/assets/banner/ContactBanner.jpg';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ContactPage() {
  const [form] = Form.useForm();
  const createContactMutation = useCreateContact();
  
  // Here, pass an ID (you might replace `1` with a dynamic value)
  const { data: config, isLoading: isLoadingConfig } = useConfigOne(1);

  const onFinish = async (values: CreateContactPayload) => {
    try {
      await createContactMutation.mutateAsync(values);
      message.success('Tin nhắn đã được gửi thành công!');
      form.resetFields();
    } catch (error: any) {
      // Error handling is done in the hook
       message.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!');
    }
  };

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

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src={ContactBanner}
            alt="Liên hệ với chúng tôi"
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <Card className="shadow-lg p-4">
          <Title level={3} className="text-center mb-6">Gửi tin nhắn cho chúng tôi</Title>
          <Form
            form={form}
            layout="vertical"
            name="contact_form"
            onFinish={onFinish}
            initialValues={{ name: '', email: '', mobile: '', message: '' }}
          >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn!' }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
              <Input placeholder="example@gmail.com" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại (Tùy chọn)"
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { validator: validateMobile },
              ]}>
              <Input placeholder="090 123 4567" />
            </Form.Item>

            <Form.Item
              label="Nội dung tin nhắn"
              name="message"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn!' }]}>
              <TextArea rows={5} placeholder="Nhập nội dung bạn muốn liên hệ..." />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createContactMutation.isPending}
                block
                className="!h-10"
              >
                Gửi liên hệ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <hr className="my-12 border-gray-300" />

      <Title level={3} className="text-center mb-8">Tìm chúng tôi trên bản đồ và thông tin liên hệ</Title>
      {isLoadingConfig ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : config ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
            {config.googlemap ? (
              <iframe
                src={config.googlemap}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                <Text>Không có bản đồ Google Maps được cấu hình.</Text>
              </div>
            )}
          </div>

          <Card className="shadow-lg p-4 h-full flex flex-col justify-center">
            <Title level={4} className="mb-4 text-center md:text-left">Thông tin liên hệ của chúng tôi</Title>
            <div className="space-y-4">
              {config.name && (
                <Paragraph className="flex items-center text-lg">
                  <i className="fas fa-building mr-3 text-blue-500"></i>
                  <Text strong className="!text-lg">Tên công ty:</Text> <Text className="ml-2 !text-lg">{config.name}</Text>
                </Paragraph>
              )}
              {config.address && (
                <Paragraph className="flex items-start text-lg">
                  <i className="fas fa-map-marker-alt mr-3 text-red-500 mt-1"></i>
                  <Text strong className="!text-lg">Địa chỉ:</Text> <Text className="ml-2 !text-lg">{config.address}</Text>
                </Paragraph>
              )}
              {config.mobile && (
                <Paragraph className="flex items-center text-lg">
                  <i className="fas fa-phone mr-3 text-green-500"></i>
                  <Text strong className="!text-lg">Điện thoại:</Text> <Text className="ml-2 !text-lg">{config.mobile}</Text>
                </Paragraph>
              )}
              {config.email && (
                <Paragraph className="flex items-center text-lg">
                  <i className="fas fa-envelope mr-3 text-purple-500"></i>
                  <Text strong className="!text-lg">Email:</Text> <Text className="ml-2 !text-lg">{config.email}</Text>
                </Paragraph>
              )}

              {(config.facebook || config.zalo || config.instagram || config.tiktok || config.youtube || config.x || config.linkedin) && (
                <>
                  <Title level={5} className="!mt-6 mb-3 text-center md:text-left">Kết nối với chúng tôi:</Title>
                  <Space size="middle" className="flex justify-center md:justify-start">
                    {config.facebook && (
                      <Tooltip title="Facebook">
                        <a href={config.facebook} target="_blank" rel="noopener noreferrer">
                          <FacebookOutlined style={{ fontSize: '32px', color: '#1877F2' }} />
                        </a>
                      </Tooltip>
                    )}
                    {config.zalo && (
                      <Tooltip title="Zalo">
                        <a href={`https://zalo.me/${config.zalo}`} target="_blank" rel="noopener noreferrer">
                          <i className="fa-solid fa-message-dots" style={{ fontSize: '32px', color: '#0084FF' }}></i>
                        </a>
                      </Tooltip>
                    )}
                    {config.instagram && (
                      <Tooltip title="Instagram">
                        <a href={config.instagram} target="_blank" rel="noopener noreferrer">
                          <InstagramOutlined style={{ fontSize: '32px', color: '#E4405F' }} />
                        </a>
                      </Tooltip>
                    )}
                    {config.tiktok && (
                      <Tooltip title="TikTok">
                        <a href={config.tiktok} target="_blank" rel="noopener noreferrer">
                          <i className="fa-brands fa-tiktok" style={{ fontSize: '32px', color: '#000000' }}></i>
                        </a>
                      </Tooltip>
                    )}
                    {config.youtube && (
                      <Tooltip title="YouTube">
                        <a href={config.youtube} target="_blank" rel="noopener noreferrer">
                          <YoutubeOutlined style={{ fontSize: '32px', color: '#FF0000' }} />
                        </a>
                      </Tooltip>
                    )}
                    {config.x && (
                      <Tooltip title="X (Twitter)">
                        <a href={config.x} target="_blank" rel="noopener noreferrer">
                          <TwitterOutlined style={{ fontSize: '32px', color: '#1DA1F2' }} />
                        </a>
                      </Tooltip>
                    )}
                    {config.linkedin && (
                      <Tooltip title="LinkedIn">
                        <a href={config.linkedin} target="_blank" rel="noopener noreferrer">
                          <LinkedinOutlined style={{ fontSize: '32px', color: '#0A66C2' }} />
                        </a>
                      </Tooltip>
                    )}
                  </Space>
                </>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center h-48">
          <Text type="secondary">Không thể tải thông tin cấu hình.</Text>
        </div>
      )}
    </div>
  );
}
