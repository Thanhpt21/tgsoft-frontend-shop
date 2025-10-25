'use client';

import React from 'react';
import Link from 'next/link';
import { Spin, Empty, Breadcrumb } from 'antd';

import { useAllBlogs } from '@/hooks/blog/useAllBlogs';

import { BlogCard } from '@/components/layout/blog/BlogCard';
import { Blog } from '@/types/blog.type';

export default function NewsPage() {
  // Gọi hook không cần tham số
  const { data: blogs, isLoading, isError } = useAllBlogs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải tin tức..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-xl">
        Đã có lỗi xảy ra khi tải tin tức. Vui lòng thử lại sau.
      </div>
    );
  }

  const publishedBlogs = blogs?.filter((blog: Blog) => blog.isPublished) || [];

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Tin tức
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {publishedBlogs.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-xl text-gray-600">
              Không tìm thấy bài viết nào phù hợp.
            </span>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publishedBlogs.map((blog: Blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
