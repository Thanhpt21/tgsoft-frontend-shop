'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Spin, Empty } from 'antd';

import { useAllBlogs } from '@/hooks/blog/useAllBlogs';

import { BlogCard } from '@/components/layout/blog/BlogCard';
import { Blog } from '@/types/blog.type';

// React.memo giúp tránh việc re-render không cần thiết cho BlogCard
const MemoizedBlogCard = React.memo(BlogCard);

export default function NewsPage() {
  // Gọi hook không cần tham số
  const { data: blogs, isLoading, isError } = useAllBlogs();

  // Sử dụng useMemo để tối ưu việc lọc dữ liệu
  const publishedBlogs = useMemo(() => {
    return blogs?.filter((blog: Blog) => blog.isPublished) || [];
  }, [blogs]);

  // Render Loading Spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Tin tức</span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex justify-center items-center h-[400px]">
            <Spin size="large" tip="Đang tải tin tức..." />
          </div>
        </div>
      </div>
    );
  }

  // Render khi có lỗi
  if (isError) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Tin tức</span>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex justify-center items-center h-[400px] text-red-600 text-xl">
            Đã có lỗi xảy ra khi tải tin tức. Vui lòng thử lại sau.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Tin tức</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
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
              <MemoizedBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}