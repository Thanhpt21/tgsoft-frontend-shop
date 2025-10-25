'use client';

import OrderTable from '@/components/admin/order/OrderTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminOrderPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách đơn hàng</Title>
    <OrderTable />
    </div>
  );
}