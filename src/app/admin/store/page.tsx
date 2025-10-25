'use client';

import StoreTable from '@/components/admin/store/StoreTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminStorePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách cửa hàng</Title>
      <StoreTable />
    </div>
  );
}