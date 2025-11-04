'use client';

import React from 'react';
import Link from 'next/link';
import { Image } from 'antd';
import { CalendarOutlined, ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';

import { Blog } from '@/types/blog.type';
import { getImageUrl } from '@/utils/getImageUrl';

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const imageSrc = getImageUrl(blog.thumb ?? '') || '/images/no-image.png';

  return (
    <Link href={`/tin-tuc/${blog.slug}`} className="block group">
      <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
        {/* Image Container with Overlay */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <Image
            src={imageSrc}
            alt={blog.title}
            preview={false}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            fallback="/images/no-image.png"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {blog.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {blog.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Category Badge (Optional - if you have category data) */}
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
              Tin tức
            </span>

            {/* Read More Button */}
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
              <span className="text-sm">Đọc thêm</span>
              <ArrowRightOutlined className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 transition-all duration-500 pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default BlogCard;