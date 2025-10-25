'use client'


import BlogCategoryTable from '@/components/admin/blog-category/BlogCategoryTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminBlogCategoryPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách danh mục blog</Title>
      <BlogCategoryTable />
    </div>
  )
}
