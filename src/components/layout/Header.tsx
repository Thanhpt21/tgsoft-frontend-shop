'use client';

import { Button, Menu, Dropdown, Badge, Spin, Avatar } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import { useWishlist } from '@/stores/useWishlistStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/getImageUrl'; // Đảm bảo import hàm này
import { useMyCart } from '@/hooks/cart/useMyCart';

interface HeaderProps {
  config: Config;
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Wishlist
  const { items: wishlistItems } = useWishlist();
  const wishlistItemCount = wishlistItems.length;

  // User Auth
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  const isLoggedInUI = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use the custom hook to get the cart data
  const { data: cartData, isLoading: isCartLoading } = useMyCart();

  // Get the number of items in the cart
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

  // Lọc bỏ các giá trị falsy như false hoặc undefined từ mảng
  const filteredUserDropdownMenuItems = userDropdownMenuItems.flat().filter((item) => item !== false);

  const userDropdownMenu = (
    <Menu items={filteredUserDropdownMenuItems} />
  );


  // Menu chính
  const mainMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/gioi-thieu' },
    { label: 'Sản phẩm', href: '/san-pham' },
    { label: 'Tin tức', href: '/tin-tuc' },
    { label: 'Liên hệ', href: '/lien-he' },
  ];

  const selectedKeys = [pathname];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 lg:px-12 md:px-8 p-4 container mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl text-black">
            {config.name || 'Tên trang web'}
          </span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex flex-grow justify-center">
          <Menu mode="horizontal" selectedKeys={selectedKeys} className="border-none">
            {mainMenuItems.map((item) => (
              <Menu.Item key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </div>

        {/* Right Section: Cart, Wishlist, User */}
        <div className="flex items-center space-x-4">

          {/* Cart */}
          <Link href="/gio-hang">
            <Badge count={cartItemCount} offset={[-5, 5]} showZero={false}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="!text-gray-700 hover:!text-blue-600"
              />
            </Badge>
          </Link>

          {/* User */}
          {isLoggedInUI ? (
            <Dropdown overlay={userDropdownMenu} trigger={['click']} placement="bottomRight">
              <Button
                type="text"
                icon={currentUser?.avatar ? (
                  <Avatar src={getImageUrl(currentUser.avatar)} size="small" />
                ) : (
                  <UserOutlined />
                )}
                className="!text-gray-700 hover:!text-blue-600"
                onClick={() => {}}
                disabled={isAuthLoading || isLogoutPending}
                loading={isLogoutPending}
              />
            </Dropdown>
          ) : (
            <Button
              type="text"
              icon={<UserOutlined />}
              className="!text-gray-700 hover:!text-blue-600"
              onClick={() => router.push('/login')}
              disabled={isAuthLoading || isLogoutPending}
              loading={isLogoutPending}
            />
          )}

          {/* Mobile Menu */}
          {/* <div className="md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="!text-gray-700 hover:!text-blue-600"
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div> */}
        </div>
      </div>

      {/* Mobile Drawer */}
      {/* <Drawer
        title="Menu"
        placement="right"
        closable
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex flex-col space-y-2 p-4">
          {mainMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t space-y-2">
            <Link href="/gio-hang" className="block text-gray-700 hover:text-blue-600">
              Giỏ hàng ({cartItemCount})
            </Link>

            {isLoggedInUI ? (
              <Button type="text" onClick={handleLogout} className="text-left w-full">
                Đăng xuất
              </Button>
            ) : (
              <Link href="/login" className="block text-gray-700 hover:text-blue-600">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </Drawer> */}
    </header>
  );
};

export default Header;
