'use client';

import PromotionTable from '@/components/admin/promotion/PromotionTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminPromotionPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách khuyến mãi</Title>
      <PromotionTable />
    </div>
  );
}
