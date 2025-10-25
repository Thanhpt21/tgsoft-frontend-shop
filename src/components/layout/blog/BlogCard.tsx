'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Image } from 'antd';

import { Blog } from '@/types/blog.type';
import { getImageUrl } from '@/utils/getImageUrl';

const { Meta } = Card;

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const imageSrc = getImageUrl(blog.thumb ?? '') || ''; 

  return (
    <Link key={blog.id} href={`/tin-tuc/${blog.slug}`} passHref>
      <Card
        hoverable
        className="w-full h-full flex flex-col transition-shadow duration-300 hover:shadow-xl"
        cover={
          <Image
            src={imageSrc} // Safely using imageSrc after null/empty handling
            alt={blog.title}
            width="100%"
            height={200}
            preview={false} // Disables image preview
            className="object-cover w-full h-48"
          />
        }
      >
        <Meta
          title={<span className="text-lg font-semibold line-clamp-2">{blog.title}</span>}
          description={
            <>
              <p className="text-gray-600 text-sm line-clamp-3 mb-2">{blog.description}</p>
              <div className="text-xs text-gray-500">
                Ngày đăng: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </div>
              <div className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                Đọc thêm &rarr;
              </div>
            </>
          }
        />
      </Card>
    </Link>
  );
};
