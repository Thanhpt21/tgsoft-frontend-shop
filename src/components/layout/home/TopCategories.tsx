'use client'

import React from 'react'
import { Image } from 'antd'
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
  const { data: categories, isLoading } = useAllCategories()

  if (isLoading || !categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center uppercase tracking-wide">
          Danh mục sản phẩm
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {categories.map((cat: Category) => (
            <Link
              key={cat.id}
              href={`/san-pham?categoryId=${cat.id}`}
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full bg-gray-50 border border-gray-200 group-hover:border-black transition-colors duration-300 flex items-center justify-center p-2 overflow-hidden">
                 <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={getImageUrl(cat.thumb ?? null) || '/images/no-image.png'}
                      alt={cat.name}
                      preview={false}
                      className="group-hover:scale-105 transition-transform duration-500"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                 </div>
              </div>
              <span className="text-center text-sm font-semibold text-gray-600 group-hover:text-black transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}