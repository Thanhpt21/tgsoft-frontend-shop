'use client';


import ConfigTable from '@/components/config/ConfigTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminConfigPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Cấu hình hệ thống</Title>
      <ConfigTable />
    </div>
  );
}