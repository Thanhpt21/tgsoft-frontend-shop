// src/app/admin/shipping/page.tsx
'use client';

import ShippingTable from '@/components/admin/shipping/ShippingTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminShippingPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý phí vận chuyển</Title>
      <ShippingTable />
    </div>
  );
}