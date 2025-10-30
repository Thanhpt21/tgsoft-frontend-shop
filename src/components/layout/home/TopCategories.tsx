'use client'

import React, { useState } from 'react'
import { Image } from 'antd'
import { getImageUrl } from '@/utils/getImageUrl'

interface Category {
  id: number
  name: string
  slug: string
  thumb?: string
}

export default function TopCategories() {
  // Dữ liệu cứng
const [categories] = useState<Category[]>([
  { id: 1, name: 'Thời Trang', slug: 'thoi-trang', thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?fit=crop&w=200&h=200' },
  { id: 2, name: 'Điện Tử', slug: 'dien-tu', thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?fit=crop&w=200&h=200' },
  { id: 3, name: 'Gia Dụng', slug: 'gia-dung', thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?fit=crop&w=200&h=200  ' },
  { id: 4, name: 'Sách', slug: 'sach', thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?fit=crop&w=200&h=200' },
  { id: 5, name: 'Đồ Chơi', slug: 'do-choi', thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?fit=crop&w=200&h=200' },
  { id: 6, name: 'Thể Thao', slug: 'the-thao', thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?fit=crop&w=200&h=200' },
])



  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🏷️ Top Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              // href={`/danh-muc/${cat.slug}`}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 mb-2 rounded-full overflow-hidden">
                <Image
                  src={getImageUrl(cat.thumb ?? null) || '/images/no-image.png'}
                  alt={cat.name}
                  preview={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="text-center text-sm font-medium text-gray-700 truncate">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
