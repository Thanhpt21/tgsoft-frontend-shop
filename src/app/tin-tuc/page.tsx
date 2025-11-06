'use client';

import React from 'react';
import Link from 'next/link';
import { Spin, Empty } from 'antd';

import { useAllBlogs } from '@/hooks/blog/useAllBlogs';

import { BlogCard } from '@/components/layout/blog/BlogCard';
import { Blog } from '@/types/blog.type';

export default function NewsPage() {
  // Gọi hook không cần tham số
  const { data: blogs, isLoading, isError } = useAllBlogs();

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

  const publishedBlogs = blogs?.filter((blog: Blog) => blog.isPublished) || [];

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

      {/* Main Container - giống width với About Us */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="min-h-[400px] flex items-center justify-center">
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
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {publishedBlogs.map((blog: Blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}