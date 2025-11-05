"use client";

import React from "react";
import { Form, Input, Button, message, Spin, Typography } from "antd";
import { useCreateContact } from "@/hooks/contact/useCreateContact";
import { useConfigOne } from "@/hooks/config/useConfigOne";
import { CreateContactPayload } from "@/types/contact.type";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useConfigByTenant } from "@/hooks/config/useConfigByTenant";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ContactPage() {
  const [form] = Form.useForm();
  const createContactMutation = useCreateContact();
  const { data: config, isLoading, isError } = useConfigByTenant();
  const onFinish = async (values: CreateContactPayload) => {
    try {
      await createContactMutation.mutateAsync(values);
      message.success("Tin nhắn đã được gửi thành công!");
      form.resetFields();
    } catch {
      message.error("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  const validateMobile = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const phoneRegex = /^(0[2-9]\d{8,9}|[+]84[2-9]\d{8,9})$/;
    return phoneRegex.test(value)
      ? Promise.resolve()
      : Promise.reject("Số điện thoại không hợp lệ");
  };

  const extractMapSrc = (embedCode: string): string => {
    const srcMatch = embedCode.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : "";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main container - giống width Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm border border-blue-200/50">
            <SendOutlined className="text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Liên hệ với chúng tôi
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hãy kết nối với chúng tôi
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-24">
          {/* Contact Form */}
          <div className="group">
            <div className="bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden p-6 md:p-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <SendOutlined className="text-white text-xl" />
                  </div>
                  <Title level={3} className="!mb-0 !text-2xl font-bold">
                    Gửi tin nhắn
                  </Title>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  name="contact_form"
                  onFinish={onFinish}
                  initialValues={{
                    name: "",
                    email: "",
                    mobile: "",
                    message: "",
                  }}
                >
                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Họ và tên</span>}
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập họ và tên của bạn!" }]}
                  >
                    <Input
                      placeholder="Nguyễn Văn A"
                      className="!h-12 sm:!h-14 !rounded-xl !border-2 hover:!border-blue-400 focus:!border-blue-500 !text-base"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Email</span>}
                    name="email"
                    rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}
                  >
                    <Input
                      placeholder="example@gmail.com"
                      className="!h-12 sm:!h-14 !rounded-xl !border-2 hover:!border-blue-400 focus:!border-blue-500 !text-base"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Số điện thoại</span>}
                    name="phone"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại" },
                      { validator: validateMobile },
                    ]}
                  >
                    <Input
                      placeholder="090 123 4567"
                      className="!h-12 sm:!h-14 !rounded-xl !border-2 hover:!border-blue-400 focus:!border-blue-500 !text-base"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Nội dung tin nhắn</span>}
                    name="message"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung tin nhắn!" }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Nhập nội dung bạn muốn liên hệ..."
                      className="!rounded-xl !border-2 hover:!border-blue-400 focus:!border-blue-500 !text-base"
                    />
                  </Form.Item>

                  <Form.Item className="!mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={createContactMutation.isPending}
                      block
                      className="!h-14 sm:!h-16 !rounded-xl !text-base sm:!text-lg font-bold !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      icon={<SendOutlined />}
                    >
                      Gửi liên hệ ngay
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Spin size="large" />
              </div>
            ) : (
              config && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 lg:p-8 mb-6">
                    <Title level={4} className="!mb-0 !text-xl sm:!text-2xl font-bold text-center">
                      Thông tin liên hệ
                    </Title>
                  </div>
                  {config.name && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                          <ShopOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-gray-500 text-xs font-semibold block">Tên công ty</Text>
                          <Text className="text-gray-900 font-bold text-sm sm:text-base truncate block">{config.name}</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.showAddress && config.address && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 group cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                          <EnvironmentOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-gray-500 text-xs font-semibold block">Địa chỉ</Text>
                          <Text className="text-gray-900 font-bold text-sm sm:text-base leading-relaxed">{config.address}</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.showMobile && config.mobile && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                          <PhoneOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-gray-500 text-xs font-semibold block">Điện thoại</Text>
                          <Text className="text-gray-900 font-bold text-sm sm:text-base">{config.mobile}</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.showEmail && config.email && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                          <MailOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-gray-500 text-xs font-semibold block">Email</Text>
                          <Text className="text-gray-900 font-bold text-sm sm:text-base truncate block">{config.email}</Text>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Map & Social Section */}
        {!isLoading && config && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg overflow-hidden h-full min-h-[400px]">
                {config.showGooglemap && config.googlemap ? (
                  <iframe
                    src={extractMapSrc(config.googlemap)}
                    className="w-full h-full min-h-[400px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <EnvironmentOutlined className="text-4xl text-gray-400" />
                      </div>
                      <Text className="text-lg font-semibold">Không có bản đồ được cấu hình</Text>
                      <Text className="text-sm text-gray-400 block mt-2">
                        Vui lòng thêm Google Maps embed code
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-6 lg:p-10">
              <Title level={4} className="!mb-6 lg:!mb-8 !text-xl sm:!text-2xl font-bold text-center">
                Kết nối với chúng tôi
              </Title>
              <div className="grid grid-cols-2 gap-4 lg:gap-5">
                {config.showFacebook && config.facebook && (
                  <a
                    href={config.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <FacebookOutlined className="text-4xl sm:text-5xl text-blue-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">Facebook</Text>
                  </a>
                )}
                {config.showInstagram && config.instagram && (
                  <a
                    href={config.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-pink-50 hover:bg-pink-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <InstagramOutlined className="text-4xl sm:text-5xl text-pink-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">Instagram</Text>
                  </a>
                )}
                {config.showYoutube && config.youtube && (
                  <a
                    href={config.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <YoutubeOutlined className="text-4xl sm:text-5xl text-red-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">YouTube</Text>
                  </a>
                )}
                {config.showX && config.x && (
                  <a
                    href={config.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-sky-50 hover:bg-sky-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <TwitterOutlined className="text-4xl sm:text-5xl text-sky-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">Twitter</Text>
                  </a>
                )}
                {config.showLinkedin && config.linkedin && (
                  <a
                    href={config.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <LinkedinOutlined className="text-4xl sm:text-5xl text-blue-700 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">LinkedIn</Text>
                  </a>
                )}
                {config.showTiktok && config.tiktok && (
                  <a
                    href={config.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">TikTok</Text>
                  </a>
                )}
                {config.showZalo && config.zalo && (
                  <a
                    href={`https://zalo.me/${config.zalo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                  >
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 text-blue-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <Text className="text-xs sm:text-sm font-semibold text-gray-600">Zalo</Text>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}