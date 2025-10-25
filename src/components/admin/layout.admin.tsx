'use client';

import { Layout } from 'antd';
import { useState } from 'react';
import SidebarAdmin from './sidebar.admin';
import HeaderAdmin from './header.admin';

const { Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = (value: boolean) => {
    setCollapsed(value);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SidebarAdmin collapsed={collapsed} /> {/* Chỉ truyền collapsed */}
      <Layout className="site-layout">
        <HeaderAdmin collapsed={collapsed} onCollapse={onCollapse} />
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}