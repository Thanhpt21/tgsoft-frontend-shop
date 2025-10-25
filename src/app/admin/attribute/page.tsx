'use client';


import AttributeTable from '@/components/admin/attribute/AttributeTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminAttributePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">
        Danh sách thuộc tính
      </Title>
      <AttributeTable />
    </div>
  );
}
