"use client";

import { Menu, Dropdown, Spin, Avatar, Drawer, Collapse, Popover, Badge } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LoadingOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  LogoutOutlined,
  SettingOutlined
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Config } from "@/types/config.type";
import { useLogout } from "@/hooks/auth/useLogout";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/getImageUrl";
import { formatVND } from "@/utils/helpers";
import { useCartStore } from "@/stores/cartStore";
import { useAllCategories } from "@/hooks/category/useAllCategories";
import CartPreviewDropdown from "@/components/layout/cart/CartPreviewDropdown";

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

// ==================== SEARCH BAR COMPONENT ====================
const SearchBar = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useAllCategories();
  const displayCategories = categories?.slice(0, 8) || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchValue.trim())}`);
      setIsFocused(false);
      setSearchValue("");
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full h-9 sm:h-10 pl-4 pr-10 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          <SearchOutlined className="text-base" />
        </button>
      </form>

      {(isFocused || searchValue) && displayCategories.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">TÌM KIẾM NHIỀU NHẤT</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/san-pham?categoryId=${category.id}`}
                  onClick={() => setIsFocused(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-gray-200 hover:border-blue-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== HEADER COMPONENT ====================
const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  
  // State quản lý đóng mở
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // State mới: Quản lý Popover giỏ hàng trên Desktop
  const [isCartPopoverOpen, setIsCartPopoverOpen] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  const isLoggedInUI = !!currentUser;
  const isAdmin = currentUser?.role === "admin";

  const { data: categories, isLoading: isCategoriesLoading } = useAllCategories();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // QUAN TRỌNG: Tự động đóng tất cả các menu/popup khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileCartOpen(false);
    setIsCartPopoverOpen(false);
    setIsSearchOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleLogout = () => logoutUser();
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // Menu Dropdown cho Desktop
  const userDropdownMenuItems = [
    isAuthLoading
      ? { key: "loading", label: <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />, disabled: true }
      : isLoggedInUI
      ? [
          { key: "account", label: <Link href="/tai-khoan" className="flex items-center gap-2">Tài khoản</Link> },
          isAdmin && { key: "admin", label: <Link href="/admin" className="flex items-center gap-2">Quản trị</Link> },
          { key: "logout", label: <span onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer">{isLogoutPending ? <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} /> : <>Đăng xuất</>}</span> },
        ]
      : [{ key: "login", label: <Link href="/login">Đăng nhập</Link> }],
  ];

  const filteredUserDropdownMenuItems = userDropdownMenuItems.flat().filter((item) => item !== false);
  const userDropdownMenu = <Menu items={filteredUserDropdownMenuItems} className="!rounded-xl !shadow-xl !border-0" />;

  const buildMegaMenu = () => {
    if (!categories || categories.length === 0) {
      return { layout: "single", links: [{ label: "Tất cả sản phẩm", href: "/san-pham" }] };
    }
    const allLinks = categories.map((cat: Category) => ({ label: cat.name, href: `/san-pham?categoryId=${cat.id}` }));
    if (categories.length <= 10) {
      return { layout: "single", links: allLinks };
    } else {
      const halfLength = Math.ceil(categories.length / 2);
      return { layout: "columns", firstHalf: allLinks.slice(0, halfLength), secondHalf: allLinks.slice(halfLength) };
    }
  };

  const mainMenuItems = [
    { label: "Trang chủ", href: "/", hasDropdown: false },
    { label: "Danh mục", href: "/san-pham", hasDropdown: true, megaMenu: buildMegaMenu() },
    { label: "Về chúng tôi", href: "/gioi-thieu", hasDropdown: false },
    { label: "Tin tức", href: "/tin-tuc", hasDropdown: false },
    { label: "Liên hệ", href: "/lien-he", hasDropdown: false },
  ];

  const CartButton = (
    <button 
      onClick={() => isMobile && setIsMobileCartOpen(true)}
      className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200"
    >
      <ShoppingCartOutlined className="text-base sm:text-lg" />
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full px-1">
          {cartItemCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md border-b border-gray-200" : "bg-white shadow-sm border-b border-gray-100"}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px]">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
              {config?.logo ? (
                <div className="relative h-12 sm:h-16 w-40 sm:w-52">
                  <Image src={getImageUrl(config.logo) || "/default-logo.png"} alt={config?.name || "Logo"} fill className="object-contain" unoptimized sizes="(max-width: 768px) 150px, 200px" priority />
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-semibold">{config?.name || "My Website"}</span>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className={`hidden lg:flex flex-1 justify-center mx-4 transition-all duration-300 ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible absolute"}`}>
              <div className="w-full max-w-xl"><SearchBar /></div>
            </div>

            {/* Main Navigation - Desktop */}
            <nav className={`hidden lg:flex items-center space-x-1 flex-1 justify-center mx-4 transition-all duration-300 ${isSearchOpen ? "opacity-0 invisible absolute" : "opacity-100 visible"}`}>
              {mainMenuItems.map((item) => (
                <div key={item.href} className="relative" onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)} onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}>
                  <Link href={item.href} className={`flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors duration-200 ${pathname === item.href ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>
                    {item.label}
                    {item.hasDropdown && (
                      <svg className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </Link>
                  {item.hasDropdown && item.megaMenu && (
                    <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-200 ${openDropdown === item.label ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                      <div className={`bg-white rounded-lg shadow-xl border border-gray-100 p-6 ${item.megaMenu.layout === "columns" ? "min-w-[600px]" : "min-w-auto max-w-full"}`}>
                        {isCategoriesLoading ? <div className="flex justify-center items-center py-8"><Spin size="small" /></div> : item.megaMenu.layout === "single" ? (
                          <div className="flex flex-wrap gap-2">
                            {item.megaMenu.links?.map((link: any) => (
                              <Link key={link.href} href={link.href} className="px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-gray-200 hover:border-blue-200 whitespace-nowrap" onClick={() => setOpenDropdown(null)}>{link.label}</Link>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-8">
                            <div><ul className="space-y-2">{item.megaMenu.firstHalf?.map((link: any) => (<li key={link.href}><Link href={link.href} className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors" onClick={() => setOpenDropdown(null)}>{link.label}</Link></li>))}</ul></div>
                            <div><ul className="space-y-2">{item.megaMenu.secondHalf?.map((link: any) => (<li key={link.href}><Link href={link.href} className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors" onClick={() => setOpenDropdown(null)}>{link.label}</Link></li>))}</ul></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button onClick={toggleSearch} className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors duration-200 ${isSearchOpen ? "bg-gray-900 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                {isSearchOpen ? <CloseOutlined className="text-base sm:text-lg" /> : <SearchOutlined className="text-base sm:text-lg" />}
              </button>

              {/* Cart Button */}
              {isMobile ? (
                 CartButton
              ) : (
                 <Popover
                   content={
                     <CartPreviewDropdown items={cartItems as any[]} isLoading={false} getImageUrl={(url?: string) => getImageUrl(url) as string} formatVND={formatVND} />
                   }
                   trigger={["hover"]}
                   placement="bottomRight"
                   overlayInnerStyle={{ padding: 0, borderRadius: "12px" }}
                   // Fix: Kiểm soát trạng thái mở bằng state
                   open={isCartPopoverOpen}
                   onOpenChange={setIsCartPopoverOpen}
                 >
                   {CartButton}
                 </Popover>
              )}

              {/* Desktop User Menu */}
              <div className="hidden md:block">
                {isLoggedInUI ? (
                  <Dropdown overlay={userDropdownMenu} trigger={["click"]} placement="bottomRight">
                    <button className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50" disabled={isAuthLoading || isLogoutPending}>
                      {isLogoutPending ? <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /> : currentUser?.avatar ? <Avatar src={getImageUrl(currentUser.avatar)} size={32} /> : <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><UserOutlined className="text-xs sm:text-sm" /></div>}
                    </button>
                  </Dropdown>
                ) : (
                  <button onClick={() => router.push("/login")} disabled={isAuthLoading || isLogoutPending} className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50">
                    <UserOutlined className="text-base sm:text-lg" />
                  </button>
                )}
              </div>
              
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                <MenuOutlined className="text-base sm:text-lg" />
              </button>
            </div>
          </div>
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? "max-h-20 opacity-100 pb-3" : "max-h-0 opacity-0"}`}>
            <div className="border-t border-gray-100 pt-3"><SearchBar /></div>
          </div>
        </div>

        {/* 1. Mobile Menu Drawer */}
        {mounted && (
          <Drawer title={<span className="text-base sm:text-lg font-bold text-gray-900">Menu</span>} placement="right" onClose={() => setIsMobileMenuOpen(false)} open={isMobileMenuOpen} width={Math.min(320, typeof window !== "undefined" ? window.innerWidth - 40 : 320)} closeIcon={<CloseOutlined className="text-gray-600" />} bodyStyle={{ padding: 0 }}>
             <div className="flex flex-col h-full">
              <nav className="flex-1 py-2 overflow-y-auto">
                {/* 1. Phần Menu Link Chính */}
                {mainMenuItems.map((item) => (
                  <div key={item.href}>
                    {item.hasDropdown && item.megaMenu ? (
                      <Collapse ghost expandIconPosition="end" className="mobile-menu-collapse">
                        <Panel header={<span className={`text-sm sm:text-[15px] font-medium ${pathname === item.href ? "text-gray-900" : "text-gray-600"}`}>{item.label}</span>} key="1" className="border-0">
                          {isCategoriesLoading ? <div className="flex justify-center py-4"><Spin size="small" /></div> : <div className="space-y-1 pl-4">
                               {(item.megaMenu.layout === "single" && item.megaMenu.links ? item.megaMenu.links : [...(item.megaMenu.firstHalf || []), ...(item.megaMenu.secondHalf || [])]).map((cat:any) => (
                                  <Link key={cat.href} href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">{cat.label}</Link>
                               ))}
                            </div>}
                        </Panel>
                      </Collapse>
                    ) : (
                      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between px-4 py-3 text-sm sm:text-[15px] font-medium transition-colors duration-200 ${pathname === item.href ? "text-gray-900 bg-gray-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}><span>{item.label}</span></Link>
                    )}
                  </div>
                ))}

                {/* 2. Phần User Info */}
                <div className="mt-4 px-4 pb-6">
                  {isLoggedInUI ? (
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-3 mb-3">
                        {currentUser?.avatar ? (
                          <Avatar src={getImageUrl(currentUser.avatar)} size={40} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><UserOutlined className="text-lg" /></div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{currentUser?.name || "Người dùng"}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentUser?.email}</p>
                        </div>
                      </div>

                      {/* Các link hành động */}
                      <Link href="/tai-khoan" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <UserOutlined /> Tài khoản
                      </Link>
                      
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <SettingOutlined /> Quản trị
                        </Link>
                      )}

                      <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-left">
                        {isLogoutPending ? <Spin size="small" /> : <><LogoutOutlined /> Đăng xuất</>}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-100">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                        Đăng nhập / Đăng ký
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </Drawer>
        )}

        {/* 2. Mobile Cart Drawer (FULL WIDTH) */}
        {mounted && (
          <Drawer
            title={
               <div className="flex items-center justify-between w-full pr-6">
                 <span className="text-lg font-bold flex items-center gap-2">
                   <ShoppingCartOutlined /> Giỏ hàng ({cartItemCount})
                 </span>
               </div>
            }
            width="100%" 
            placement="right" 
            onClose={() => setIsMobileCartOpen(false)} 
            open={isMobileCartOpen} 
            closeIcon={<CloseOutlined className="text-gray-600 text-lg" />} 
            bodyStyle={{ padding: 0 }}
            headerStyle={{ padding: "16px" }}
            zIndex={99999}
          >
            <CartPreviewDropdown
              items={cartItems as any[]}
              isLoading={false}
              getImageUrl={(url?: string) => getImageUrl(url) as string}
              formatVND={formatVND}
            />
          </Drawer>
        )}
      </header>

      <style jsx global>{`
        .mobile-menu-collapse .ant-collapse-header { padding: 12px 16px !important; }
        .mobile-menu-collapse .ant-collapse-content-box { padding: 8px 0 !important; }
        @media (min-width: 640px) { .mobile-menu-collapse .ant-collapse-header { padding: 14px 16px !important; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .ant-popover-arrow { display: none !important; }
      `}</style>
    </>
  );
};

export default Header;