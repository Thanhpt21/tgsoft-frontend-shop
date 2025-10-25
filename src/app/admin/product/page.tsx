'use client';

import ProductTable from '@/components/admin/product/ProductTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminProductPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách sản phẩm</Title>
      <ProductTable />
    </div>
  );
}