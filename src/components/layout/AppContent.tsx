'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useConfigByTenant } from '@/hooks/config/useConfigByTenant';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isHomePage = pathname === '/';
  const { data: configData, isLoading, isError } = useConfigByTenant();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <div className="mt-4 text-gray-700 text-lg">Đang tải website</div>
      </div>
    );
  }

  if (isError || !configData) {
    return <div className="text-red-500">Lỗi: Không thể lấy cấu hình.</div>;
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAdminPage && <Header config={configData} />}
        
        <main className="flex-grow">
          {/* Container cố định width cho tất cả các trang trừ admin và trang chủ */}
          <div className={isAdminPage || isHomePage ? 'w-full' : 'max-w-7xl mx-auto px-4 md:px-6 lg:px-0 w-full'}>
            {children}
          </div>
        </main>

        {!isAdminPage && <Footer config={configData} />}
      </div>
    </AuthProvider>
  );
}