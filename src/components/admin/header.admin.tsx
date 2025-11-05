'use client';

import { Layout, Avatar, Dropdown, Menu, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { useLogout } from '@/hooks/auth/useLogout';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/getImageUrl';

interface HeaderAdminProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

export default function HeaderAdmin({ collapsed, onCollapse }: HeaderAdminProps) {

  const { currentUser, isLoading } = useAuth();
  const { logoutUser } = useLogout();

  const items: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => {
      },
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logoutUser(),
    },
  ];

  // Xử lý avatar user
  const avatarUrl = getImageUrl(currentUser?.avatar ?? null);

  return (
    <Layout.Header style={{ background: '#fff', padding: '0 16px' }}>
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center">
          <div
            className="cursor-pointer mr-4"
            onClick={() => onCollapse(!collapsed)}
            style={{ fontSize: '20px' }} 
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>

        {isLoading ? (
          <Spin size="small" />
        ) : (
          currentUser && (
            <Dropdown overlay={<Menu items={items} />} trigger={['click']}>
              <div className="flex items-center space-x-2 cursor-pointer select-none">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                    }}
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <span className="font-medium">{currentUser.name}</span>
                <DownOutlined />
              </div>
            </Dropdown>
          )
        )}
      </div>
    </Layout.Header>
  );
}
