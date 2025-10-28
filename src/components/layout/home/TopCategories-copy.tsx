'use client'

import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import { getImageUrl } from '@/utils/getImageUrl'

interface Category {
  id: number
  name: string
  slug: string
  thumb?: string
}

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://api.aiban.vn/categories', {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`
          }
        })
        const json = await res.json()
        const data: Category[] = Array.isArray(json.data) ? json.data : []
        setCategories(data)
      } catch (err) {
        console.error('Lỗi tải danh mục:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🏷️ Top Categories
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 h-28 rounded-lg"
              ></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
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
        ) : (
          <p className="text-center text-gray-500">Không có danh mục nào.</p>
        )}
      </div>
    </section>
  )
}
