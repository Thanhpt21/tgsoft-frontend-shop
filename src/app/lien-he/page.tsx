"use client";

import React, { useState, useCallback } from "react";
import { useCreateContact } from "@/hooks/contact/useCreateContact";
import { useConfigByTenant } from "@/hooks/config/useConfigByTenant";
import { CreateContactPayload } from "@/types/contact.type";

export default function ContactPage() {
  const createContactMutation = useCreateContact();
  const { data: config, isLoading } = useConfigByTenant();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const extractMapSrc = useCallback((embedCode: string): string => {
    const srcMatch = embedCode?.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Email không hợp lệ");
      return;
    }
    
    // Validate phone
    const phoneRegex = /^(0[2-9]\d{8,9}|[+]84[2-9]\d{8,9})$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    try {
      await createContactMutation.mutateAsync(formData);
      alert("Tin nhắn đã được gửi thành công!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      alert("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-16 md:py-20">
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
              <div className="h-96 bg-gray-100 rounded-xl"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-3">
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Trang chủ
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Liên hệ</span>
          </div>
        </div>
      </div>

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-16 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-gray-600 text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Gửi tin nhắn</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="090 123 4567"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung tin nhắn *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Nhập nội dung bạn muốn liên hệ..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createContactMutation.isPending}
                className="w-full px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createContactMutation.isPending ? 'Đang gửi...' : 'Gửi liên hệ'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Thông tin liên hệ</h4>
              
              {config && (
                <div className="space-y-4">
                  {/* Company Name */}
                  {config.name && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Tên công ty</div>
                        <div className="font-medium text-gray-900">{config.name}</div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {config.showAddress && config.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Địa chỉ</div>
                        <div className="font-medium text-gray-900">{config.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {config.showMobile && config.mobile && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Điện thoại</div>
                        <div className="font-medium text-gray-900">{config.mobile}</div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {config.showEmail && config.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{config.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            {config && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Kết nối với chúng tôi</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {config.showFacebook && config.facebook && (
                    <a
                      href={config.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <span className="text-sm font-medium text-gray-700">Facebook</span>
                    </a>
                  )}
                  {config.showInstagram && config.instagram && (
                    <a
                      href={config.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100"
                    >
                      <span className="text-sm font-medium text-gray-700">Instagram</span>
                    </a>
                  )}
                  {config.showYoutube && config.youtube && (
                    <a
                      href={config.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <span className="text-sm font-medium text-gray-700">YouTube</span>
                    </a>
                  )}
                  {config.showX && config.x && (
                    <a
                      href={config.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-sky-50 rounded-lg hover:bg-sky-100"
                    >
                      <span className="text-sm font-medium text-gray-700">Twitter</span>
                    </a>
                  )}
                  {config.showLinkedin && config.linkedin && (
                    <a
                      href={config.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                    </a>
                  )}
                  {config.showZalo && config.zalo && (
                    <a
                      href={`https://zalo.me/${config.zalo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <span className="text-sm font-medium text-gray-700">Zalo</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {config && config.showGooglemap && config.googlemap && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <iframe
              src={extractMapSrc(config.googlemap)}
              className="w-full h-96"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>
        )}
      </div>
    </div>
  );
}