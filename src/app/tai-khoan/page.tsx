'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSidebar from '@/components/layout/account/AccountSidebar';
import PersonalInfo from '@/components/layout/account/PersonalInfo';
import PurchaseHistory from '@/components/layout/account/PurchaseHistory';
import AddressShipping from '@/components/layout/account/AddressShipping';
import { useAuth } from '@/context/AuthContext';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

type AccountMenuKey = 'personal' | 'address' | 'history';

const AccountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const userId = currentUser?.id;

  const initialMenu = (searchParams.get('p') as AccountMenuKey) || 'personal';
  const [selectedMenu, setSelectedMenu] = useState<AccountMenuKey>(initialMenu);

  useEffect(() => {
    const paramMenu = (searchParams.get('p') as AccountMenuKey);
    if (['personal', 'address', 'history'].includes(paramMenu)) {
      setSelectedMenu(paramMenu);
    } else {
      setSelectedMenu('personal');
      router.replace(`?p=personal`);
    }
  }, [searchParams, router]);

  const handleMenuClick = (key: AccountMenuKey) => {
    setSelectedMenu(key);
    router.push(`?p=${key}`);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi xác thực</h2>
          <p className="text-gray-600">Không thể tải thông tin người dùng hoặc bạn chưa đăng nhập.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 w-full">
      <div className="container mx-auto max-w-7xl px-2 md:px-4">
        {/* Breadcrumb */}
        <div className="py-3 flex items-center gap-2 text-gray-600 md:px-0">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tài khoản</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2 md:px-0">
         
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-blue-600">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {currentUser?.name || 'Người dùng'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Thành viên từ {new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="p-4">
                <AccountSidebar onMenuClick={handleMenuClick} selected={selectedMenu} />
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 min-h-[600px]">
              
              {selectedMenu === 'personal' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700">
                    Xin chào <span className="font-semibold text-blue-700">{currentUser?.name || 'Người dùng'}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Từ trang quản lý tài khoản, bạn có thể xem đơn hàng gần đây, quản lý địa chỉ giao hàng và thanh toán, 
                    cũng như chỉnh sửa mật khẩu và thông tin tài khoản.
                  </p>
                </div>
              )}

              
              <div className="animate-fadeIn" key={selectedMenu}>
                {selectedMenu === 'personal' && <PersonalInfo />}
                {selectedMenu === 'address' && <AddressShipping userId={userId} />}
                {selectedMenu === 'history' && <PurchaseHistory />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AccountPage;