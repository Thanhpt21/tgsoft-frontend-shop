'use client';

import { Button, Menu, Dropdown, Badge, Spin, Avatar, Drawer } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoadingOutlined, MenuOutlined, CloseOutlined, SearchOutlined, HeartOutlined, BellOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import { useWishlist } from '@/stores/useWishlistStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/getImageUrl';
import { useMyCart } from '@/hooks/cart/useMyCart';
import { useCartStore } from '@/stores/cartStore';
import SearchBar from './common/SearchBar';

interface HeaderProps {
  config: Config;
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  const { items: wishlistItems } = useWishlist();
  const wishlistItemCount = wishlistItems.length;

  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  const isLoggedInUI = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => logoutUser();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

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
            label: <Link href="/tai-khoan" className="flex items-center gap-2"><UserOutlined /> Tài khoản</Link>,
          },
          isAdmin && {
            key: 'admin',
            label: <Link href="/admin" className="flex items-center gap-2">⚙️ Quản trị</Link>,
          },
          {
            key: 'logout',
            label: (
              <span onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                {isLogoutPending ? (
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                ) : (
                  <>🚪 Đăng xuất</>
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
  const userDropdownMenu = <Menu items={filteredUserDropdownMenuItems} className="!rounded-xl !shadow-xl !border-0" />;

  const mainMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/gioi-thieu' },
    { label: 'Sản phẩm', href: '/san-pham' },
    { label: 'Tin tức', href: '/tin-tuc' },
    { label: 'Liên hệ', href: '/lien-he' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100' 
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-50'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <span className="relative text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 inline-block">
                {config.name || 'TGSOFT'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-8">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {pathname === item.href && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></span>
                )}
                <span className="relative z-10">{item.label}</span>
                {pathname !== item.href && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section: Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Search Button - Desktop */}
            <button
              onClick={toggleSearch}
              className={`hidden md:flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
                isSearchOpen
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105'
              }`}
            >
              <SearchOutlined className="text-lg" />
            </button>

            {/* Cart Button */}
            <Link href="/gio-hang">
              <button className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105 transition-all duration-300 group">
                <ShoppingCartOutlined className="text-lg" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-1.5 shadow-lg animate-pulse">
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
                    className="flex items-center justify-center w-11 h-11 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    disabled={isAuthLoading || isLogoutPending}
                  >
                    {isLogoutPending ? (
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                    ) : currentUser?.avatar ? (
                      <Avatar 
                        src={getImageUrl(currentUser.avatar)} 
                        size={40}
                        className="ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all">
                        <UserOutlined />
                      </div>
                    )}
                  </button>
                </Dropdown>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  disabled={isAuthLoading || isLogoutPending}
                  className="relative px-6 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden group disabled:opacity-50 transition-all duration-300 hover:scale-105"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative z-10">Đăng nhập</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:scale-105 transition-all duration-300"
            >
              <MenuOutlined className="text-lg" />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar - Desktop */}
        <div
          className={`hidden md:block overflow-hidden transition-all duration-500 ease-in-out ${
            isSearchOpen ? 'max-h-24 opacity-100 pb-5' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="w-full max-w-3xl transform transition-all duration-500 ease-in-out scale-100">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Menu
            </span>
          </div>
        }
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={320}
        closeIcon={<CloseOutlined className="text-gray-600 hover:text-red-500 transition-colors" />}
        className="modern-drawer"
      >
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 p-2">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  pathname === item.href
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30">
            {isLoggedInUI ? (
              <div className="space-y-3">
                {/* User Info Card */}
                <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl shadow-md">
                  {currentUser?.avatar ? (
                    <Avatar src={getImageUrl(currentUser.avatar)} size={48} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <UserOutlined className="text-lg" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
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
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all shadow-sm"
                >
                  <UserOutlined className="text-base" />
                  <span>Tài khoản</span>
                </Link>
                
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all shadow-sm"
                  >
                    <span className="text-base">⚙️</span>
                    <span>Quản trị</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLogoutPending}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {isLogoutPending ? (
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                  ) : (
                    <>
                      <span className="text-base">🚪</span>
                      <span>Đăng xuất</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full relative px-6 py-4 rounded-xl text-sm font-bold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                <span className="relative z-10">Đăng nhập ngay</span>
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <style jsx global>{`
        .modern-drawer .ant-drawer-content {
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
        }
        .modern-drawer .ant-drawer-header {
          background: white;
          border-bottom: 1px solid #f3f4f6;
          padding: 20px 24px;
        }
        .modern-drawer .ant-drawer-body {
          padding: 0;
        }
      `}</style>
    </header>
  );
};

export default Header;