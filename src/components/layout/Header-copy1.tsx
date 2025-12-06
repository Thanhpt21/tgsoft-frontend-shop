'use client';

import { Menu, Dropdown, Badge, Spin, Avatar, Drawer, Collapse, Popover } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoadingOutlined, MenuOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import { useLogout } from '@/hooks/auth/useLogout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';
import { useCartStore } from '@/stores/cartStore';
import SearchBar from './common/SearchBar';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import CartPreviewDropdown from '@/components/layout/cart/CartPreviewDropdown';

const { Panel } = Collapse;

interface HeaderProps {
  config: Config;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  thumb?: string;
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCartPopoverOpen, setIsCartPopoverOpen] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  const isLoggedInUI = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const { data: categories, isLoading: isCategoriesLoading } = useAllCategories();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const buildMegaMenu = () => {
    if (!categories || categories.length === 0) {
      return [
        {
          links: [
            { label: 'Tất cả sản phẩm', href: '/san-pham' },
          ]
        }
      ];
    }

    const halfLength = Math.ceil(categories.length / 2);
    const firstHalf = categories.slice(0, halfLength);
    const secondHalf = categories.slice(halfLength);

    return [
      {
        links: firstHalf.map((cat: Category) => ({
          label: cat.name,
          href: `/san-pham?categoryId=${cat.id}`
        }))
      },
      {
        links: secondHalf.map((cat: Category) => ({
          label: cat.name,
          href: `/san-pham?categoryId=${cat.id}`
        }))
      }
    ];
  };

  const mainMenuItems = [
    { label: 'Trang chủ', href: '/', hasDropdown: false },
    { 
      label: 'Danh mục', 
      href: '/san-pham', 
      hasDropdown: true,
      megaMenu: buildMegaMenu()
    },
    { label: 'Về chúng tôi', href: '/gioi-thieu', hasDropdown: false },
    { label: 'Tin tức', href: '/tin-tuc', hasDropdown: false },
    { label: 'Liên hệ', href: '/lien-he', hasDropdown: false },
  ];


  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-md border-b border-gray-200' 
            : 'bg-white shadow-sm border-b border-gray-100'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px]">
            <Link
              href="/"
              className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              {config?.logo ? (
                <div className="relative h-10 sm:h-12 w-32">
                  <Image
                    src={getImageUrl(config.logo) || "/default-logo.png"}
                    alt={config?.name || "Logo"}
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="(max-width: 768px) 100px, 150px"
                    priority
                  />
                </div>
              ) : (
                <span className="text-xl font-semibold">
                  {config?.name || "My Website"}
                </span>
              )}
            </Link>

            <div className={`hidden lg:flex flex-1 justify-center mx-8 transition-all duration-300 ${
              isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible absolute'
            }`}>
              <div className="w-full max-w-2xl">
                <SearchBar />
              </div>
            </div>

            <nav className={`hidden lg:flex items-center space-x-1 flex-1 justify-center mx-8 transition-all duration-300 ${
              isSearchOpen ? 'opacity-0 invisible absolute' : 'opacity-100 visible'
            }`}>
              {mainMenuItems.map((item) => (
                <div 
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                  onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {item.hasDropdown && item.megaMenu && (
                    <div 
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-200 ${
                        openDropdown === item.label 
                          ? 'opacity-100 visible' 
                          : 'opacity-0 invisible'
                      }`}
                    >
                      <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-6 min-w-[600px]">
                        {isCategoriesLoading ? (
                          <div className="flex justify-center items-center py-8">
                            <Spin size="small" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-8">
                            {item.megaMenu.map((section, idx) => (
                              <div key={idx}>
                                <ul className="space-y-2">
                                  {section.links.map((link: any) => (
                                    <li key={link.href}>
                                      <Link
                                        href={link.href}
                                        className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setOpenDropdown(null)}
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={toggleSearch}
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors duration-200 ${
                  isSearchOpen
                    ? 'bg-gray-900 text-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isSearchOpen ? (
                  <CloseOutlined className="text-base sm:text-lg" />
                ) : (
                  <SearchOutlined className="text-base sm:text-lg" />
                )}
              </button>

              {/* Nút Giỏ hàng với Popover */}
              <Popover
                content={
                  <CartPreviewDropdown
                    items={cartItems as any[]}
                    isLoading={false}
                    getImageUrl={(url?: string) => getImageUrl(url) as string}
                    formatVND={formatVND}
                  />
                }
                trigger="hover"
                placement="bottomRight"
                overlayClassName="cart-popover"
                open={isCartPopoverOpen}
                onOpenChange={setIsCartPopoverOpen}
              >
                <button className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                  <ShoppingCartOutlined className="text-base sm:text-lg" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full px-1">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Popover>

              <div className="hidden md:block">
                {isLoggedInUI ? (
                  <Dropdown overlay={userDropdownMenu} trigger={['click']} placement="bottomRight">
                    <button
                      className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                      disabled={isAuthLoading || isLogoutPending}
                    >
                      {isLogoutPending ? (
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                      ) : currentUser?.avatar ? (
                        <Avatar 
                          src={getImageUrl(currentUser.avatar)} 
                          size={32}
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <UserOutlined className="text-xs sm:text-sm" />
                        </div>
                      )}
                    </button>
                  </Dropdown>
                ) : (
                  <button
                    onClick={() => router.push('/login')}
                    disabled={isAuthLoading || isLogoutPending}
                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  >
                    <UserOutlined className="text-base sm:text-lg" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <MenuOutlined className="text-base sm:text-lg" />
              </button>
            </div>
          </div>

          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchOpen ? 'max-h-20 opacity-100 pb-3' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-gray-100 pt-3">
              <SearchBar />
            </div>
          </div>
        </div>

        {mounted && (
          <Drawer
            title={
              <span className="text-base sm:text-lg font-bold text-gray-900">
                Menu
              </span>
            }
            placement="right"
            onClose={() => setIsMobileMenuOpen(false)}
            open={isMobileMenuOpen}
            width={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 40 : 320)}
            closeIcon={<CloseOutlined className="text-gray-600" />}
            bodyStyle={{ padding: 0 }}
          >
            <div className="flex flex-col h-full">
              <nav className="flex-1 py-2 overflow-y-auto">
                {mainMenuItems.map((item) => (
                  <div key={item.href}>
                    {item.hasDropdown && item.megaMenu ? (
                      <Collapse 
                        ghost 
                        expandIconPosition="end"
                        className="mobile-menu-collapse"
                      >
                        <Panel 
                          header={
                            <span className={`text-sm sm:text-[15px] font-medium ${
                              pathname === item.href ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {item.label}
                            </span>
                          } 
                          key="1"
                          className="border-0"
                        >
                          {isCategoriesLoading ? (
                            <div className="flex justify-center py-4">
                              <Spin size="small" />
                            </div>
                          ) : (
                            <div className="space-y-1 pl-4">
                              {categories && categories.map((cat: Category) => (
                                <Link
                                  key={cat.id}
                                  href={`/san-pham?categoryId=${cat.id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  {cat.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </Panel>
                      </Collapse>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 text-sm sm:text-[15px] font-medium transition-colors duration-200 ${
                          pathname === item.href
                            ? 'text-gray-900 bg-gray-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </div>
                ))}

                <div className="mt-2 px-3 pb-2">
                  <div className="border-t border-gray-200 pt-3">
                    {isLoggedInUI ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                          {currentUser?.avatar ? (
                            <Avatar src={getImageUrl(currentUser.avatar)} size={36} />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              <UserOutlined className="text-sm" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                              {currentUser?.name || 'Người dùng'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                              {currentUser?.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/tai-khoan"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                          <UserOutlined className="text-sm" />
                          <span>Tài khoản</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                          >
                            <span>⚙️</span>
                            <span>Quản trị</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          disabled={isLogoutPending}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
                        >
                          {isLogoutPending ? (
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                          ) : (
                            <>
                              <span>🚪</span>
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                      >
                        Đăng nhập
                      </button>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </Drawer>
        )}
      </header>

      <style jsx global>{`
        .mobile-menu-collapse .ant-collapse-header {
          padding: 12px 16px !important;
        }
        .mobile-menu-collapse .ant-collapse-content-box {
          padding: 8px 0 !important;
        }
        @media (min-width: 640px) {
          .mobile-menu-collapse .ant-collapse-header {
            padding: 14px 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;