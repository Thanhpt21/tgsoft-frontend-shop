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

  const { data: configData, isLoading, isError } = useConfigByTenant();
  const isAdminPage = pathname.startsWith('/admin');

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
        
        <main className="flex justify-center flex-grow">
          {children}
        </main>

        {!isAdminPage && <Footer config={configData} />}
      </div>
    </AuthProvider>
  );
}
