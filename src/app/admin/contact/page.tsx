// app/admin/contact/page.tsx
'use client';

import ContactTable from '@/components/admin/contact/ContactTable';
import { Typography } from 'antd';
import React from 'react'; // Ensure React is imported

const { Title } = Typography;

export default function AdminContactPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách liên hệ</Title>
      <ContactTable />
    </div>
  );
}