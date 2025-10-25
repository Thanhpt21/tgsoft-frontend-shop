'use client';


import BlogTable from '@/components/admin/blog/BlogTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminBlogPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách tin tức</Title>
      <BlogTable />
    </div>
  );
}