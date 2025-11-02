'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSidebar from '@/components/layout/account/AccountSidebar';
import PersonalInfo from '@/components/layout/account/PersonalInfo';
import PurchaseHistory from '@/components/layout/account/PurchaseHistory';
import AddressShipping from '@/components/layout/account/AddressShipping';
import { useAuth } from '@/context/AuthContext';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Thông tin tài khoản</h1>
            <div className="text-sm text-gray-500">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
              <span className="mx-2">/</span>
              <span className="text-blue-600 font-medium">Thông tin tài khoản</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
          {/* Sidebar */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* User Profile Header */}
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

              {/* Sidebar Menu */}
              <div className="p-4">
                <AccountSidebar onMenuClick={handleMenuClick} selected={selectedMenu} />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[600px] w-full">
              {/* Welcome Message */}
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

              {/* Content with smooth transition */}
              <div className="animate-fadeIn w-full overflow-x-hidden" key={selectedMenu}>
                {selectedMenu === 'personal' && (
                  <div className="w-full max-w-full">
                    <PersonalInfo />
                  </div>
                )}
                {selectedMenu === 'address' && (
                  <div className="w-full max-w-full">
                    <AddressShipping userId={userId} />
                  </div>
                )}
                {selectedMenu === 'history' && (
                  <div className="w-full max-w-full">
                    <PurchaseHistory />
                  </div>
                )}
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