'use client';

import ColorTable from '@/components/admin/color/ColorTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminColorPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách màu sắc</Title>
      <ColorTable />
    </div>
  );
}