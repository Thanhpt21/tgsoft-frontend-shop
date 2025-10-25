// src/components/layout/AppContent.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface AppContentProps {
  children: ReactNode;
}

// Giả lập dữ liệu cấu hình
export const mockConfigData = {
  id: 1,
  tenantId: 2,
  name: 'Công ty ABC',
  email: 'contact@abc.com',
  mobile: '0901234567',
  address: '123 Đường ABC, Thành phố XYZ',
  googlemap: 'https://maps.google.com/?q=123+ABC',
  facebook: 'https://facebook.com/abc',
  zalo: 'https://zalo.me/abc',
  instagram: 'https://instagram.com/abc',
  tiktok: 'https://tiktok.com/abc',
  youtube: 'https://youtube.com/abc',
  x: 'https://twitter.com/abc',
  linkedin: 'https://linkedin.com/abc',
  logo: 'https://example.com/logo.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();

  // Giả lập dữ liệu từ API (thay vì sử dụng useConfigOne)
  const configData = mockConfigData;
  const isLoading = false; // Đặt là false khi bạn đang sử dụng dữ liệu giả

  const isAdminPage = pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <div className="mt-4 text-gray-700 text-lg">Đang tải cấu hình...</div>
      </div>
    );
  }

  if (!configData) {
    return <div className="text-red-500">Lỗi: Không có cấu hình.</div>;
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAdminPage && configData && <Header config={configData} />}
        
        <main className="flex justify-center flex-grow">
          {children}
        </main>

        {!isAdminPage && configData && <Footer config={configData} />}
      </div>
    </AuthProvider>
  );
}
