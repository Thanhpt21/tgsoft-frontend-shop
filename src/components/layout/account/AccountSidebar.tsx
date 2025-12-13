'use client';

import React, { memo, useCallback, useMemo } from 'react';

interface AccountSidebarProps {
  onMenuClick: (key: 'personal' | 'address' | 'history') => void;
  selected: 'personal' | 'address' | 'history';
}

// Pre-rendered SVG icons để tránh tạo lại mỗi lần render
const PersonalIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
));

const AddressIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
));

const HistoryIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
));

const ArrowIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
));

PersonalIcon.displayName = 'PersonalIcon';
AddressIcon.displayName = 'AddressIcon';
HistoryIcon.displayName = 'HistoryIcon';
ArrowIcon.displayName = 'ArrowIcon';

// Menu item component riêng để tối ưu re-render
interface MenuItemProps {
  itemKey: 'personal' | 'address' | 'history';
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: (key: 'personal' | 'address' | 'history') => void;
}

const MenuItem = memo(({ itemKey, label, icon, isSelected, onClick }: MenuItemProps) => {
  const handleClick = useCallback(() => {
    onClick(itemKey);
  }, [itemKey, onClick]);

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
        transition-all duration-200 ease-in-out active:scale-[0.98]
        ${isSelected
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
        }
      `}
      aria-current={isSelected ? 'page' : undefined}
      aria-label={label}
    >
      <span className={`
        transition-transform duration-200
        ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
      `}>
        {icon}
      </span>
      <span className={`
        text-sm font-medium flex-1
        ${isSelected ? 'font-semibold' : ''}
      `}>
        {label}
      </span>
      {isSelected && (
        <span className="ml-auto animate-fadeIn">
          <ArrowIcon />
        </span>
      )}
    </button>
  );
});

MenuItem.displayName = 'MenuItem';

// Main component
const AccountSidebar: React.FC<AccountSidebarProps> = ({ onMenuClick, selected }) => {
  // Memoized menu items để tránh tạo lại mảng mỗi lần render
  const menuItems = useMemo(() => [
    {
      key: 'personal' as const,
      label: 'Thông tin cá nhân',
      icon: <PersonalIcon />,
    },
    {
      key: 'address' as const,
      label: 'Địa chỉ giao hàng',
      icon: <AddressIcon />,
    },
    {
      key: 'history' as const,
      label: 'Lịch sử mua hàng',
      icon: <HistoryIcon />,
    },
  ], []);

  // Memoized click handler để tránh tạo lại function
  const handleMenuClick = useCallback((key: 'personal' | 'address' | 'history') => {
    // Sử dụng requestAnimationFrame để đảm bảo smooth interaction
    requestAnimationFrame(() => {
      onMenuClick(key);
    });
  }, [onMenuClick]);

  return (
    <nav 
      className="space-y-1" 
      aria-label="Tài khoản menu"
      role="navigation"
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.key}
          itemKey={item.key}
          label={item.label}
          icon={item.icon}
          isSelected={selected === item.key}
          onClick={handleMenuClick}
        />
      ))}
      
      {/* Add fade-in animation CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

// Custom comparison function để tránh re-render không cần thiết
const arePropsEqual = (
  prevProps: Readonly<AccountSidebarProps>,
  nextProps: Readonly<AccountSidebarProps>
) => {
  // Chỉ re-render khi selected hoặc onMenuClick thay đổi
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.onMenuClick === nextProps.onMenuClick
  );
};

export default memo(AccountSidebar, arePropsEqual);