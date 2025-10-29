'use client';

import { Button, Menu, Dropdown, Badge, Spin, Avatar, Drawer } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoadingOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import { useWishlist } from '@/stores/useWishlistStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/getImageUrl';
import { useMyCart } from '@/hooks/cart/useMyCart';

interface HeaderProps {
  config: Config;
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const { items: wishlistItems } = useWishlist();
  const wishlistItemCount = wishlistItems.length;

  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  const isLoggedInUI = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartData, isLoading: isCartLoading } = useMyCart();
  const cartItemCount = cartData?.items?.length || 0;

  const handleLogout = () => logoutUser();

  const userDropdownMenuItems = [
    isAuthLoading
      ? {
          key: 'loading',
          label: <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />,
          disabled: true,
        }
      : isLoggedInUI
      ? [
          {
            key: 'account',
            label: <Link href="/tai-khoan">Tài khoản</Link>,
          },
          isAdmin && {
            key: 'admin',
            label: <Link href="/admin">Quản trị</Link>,
          },
          {
            key: 'logout',
            label: (
              <span onClick={handleLogout}>
                {isLogoutPending ? (
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                ) : (
                  'Đăng xuất'
                )}
              </span>
            ),
          },
        ]
      : [
          {
            key: 'login',
            label: <Link href="/login">Đăng nhập</Link>,
          },
      ]
  ];

  const filteredUserDropdownMenuItems = userDropdownMenuItems.flat().filter((item) => item !== false);

  const userDropdownMenu = <Menu items={filteredUserDropdownMenuItems} />;

  const mainMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/gioi-thieu' },
    { label: 'Sản phẩm', href: '/san-pham' },
    { label: 'Tin tức', href: '/tin-tuc' },
    { label: 'Liên hệ', href: '/lien-he' },
  ];

  const selectedKeys = [pathname];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600">
              {config.name || 'Tên trang web'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section: Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <Link href="/gio-hang">
              <button className="relative p-2.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group">
                <ShoppingCartOutlined className="text-xl" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full px-1.5 shadow-lg group-hover:scale-110 transition-transform">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {isLoggedInUI ? (
                <Dropdown overlay={userDropdownMenu} trigger={['click']} placement="bottomRight">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    disabled={isAuthLoading || isLogoutPending}
                  >
                    {isLogoutPending ? (
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                    ) : currentUser?.avatar ? (
                      <Avatar 
                        src={getImageUrl(currentUser.avatar)} 
                        size={32}
                        className="ring-2 ring-blue-100 hover:ring-blue-200 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                        <UserOutlined />
                      </div>
                    )}
                  </button>
                </Dropdown>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  disabled={isAuthLoading || isLogoutPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <MenuOutlined className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </span>
          </div>
        }
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={280}
        closeIcon={<CloseOutlined className="text-gray-600" />}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            {isLoggedInUI ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  {currentUser?.avatar ? (
                    <Avatar src={getImageUrl(currentUser.avatar)} size={40} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      <UserOutlined />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser?.name || 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                {/* User Actions */}
                <Link
                  href="/tai-khoan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                >
                  Tài khoản
                </Link>
                
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                  >
                    Quản trị
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLogoutPending}
                  className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-white rounded-lg transition-all text-left disabled:opacity-50"
                >
                  {isLogoutPending ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                  ) : (
                    'Đăng xuất'
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;