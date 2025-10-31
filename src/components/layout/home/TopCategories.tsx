'use client'

import React from 'react'
import { Image, Spin } from 'antd'
import { getImageUrl } from '@/utils/getImageUrl'
import { useAllCategories } from '@/hooks/category/useAllCategories'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  thumb?: string
}

export default function TopCategories() {
  // Gọi API để lấy danh sách categories
  const { data: categories, isLoading, isError } = useAllCategories()

  // Loading state
  if (isLoading) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            🏷️ Top Categories
          </h2>
          <div className="flex justify-center items-center min-h-[200px]">
            <Spin size="large" />
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (isError) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            🏷️ Top Categories
          </h2>
          <div className="text-center text-red-500">
            Không thể tải danh mục. Vui lòng thử lại sau.
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            🏷️ Top Categories
          </h2>
          <div className="text-center text-gray-500">
            Chưa có danh mục nào.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🏷️ Top Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat: Category) => (
            <Link
              key={cat.id}
              href={`/san-pham?categoryId=${cat.id}`}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-20 h-20 mb-2 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
                <Image
                  src={getImageUrl(cat.thumb ?? null) || '/images/no-image.png'}
                  alt={cat.name}
                  preview={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="text-center text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate w-full transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}