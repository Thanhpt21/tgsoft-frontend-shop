'use client'

import React, { useState, useMemo } from 'react'
import { useAllCategories } from '@/hooks/category/useAllCategories'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ChevronRight, 
  Grid3X3,
  Tag,
  TrendingUp,
  Package,
  Zap,
  ArrowRight,
  Filter,
  Layers,
  Hash
} from 'lucide-react'

interface Category {
  id: number
  name: string
  thumb?: string
  productCount?: number
}

// Skeleton loading component
const CategorySkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="group flex flex-col items-center"
  >
    <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
    <div className="h-4 w-16 bg-gray-200 rounded"></div>
  </motion.div>
)

// Fallback image component
const CategoryImage = ({ 
  thumb, 
  name, 
  index 
}: { 
  thumb?: string; 
  name: string; 
  index: number 
}) => {
  if (thumb) {
    return (
      <img
        src={thumb.startsWith('http') ? thumb : `${process.env.NEXT_PUBLIC_API_URL}${thumb}`}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading={index < 12 ? "eager" : "lazy"}
      />
    )
  }

  // Fallback với màu gradient dựa trên index
  const gradients = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-emerald-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-violet-500',
    'from-cyan-500 to-blue-500'
  ]
  
  const gradient = gradients[index % gradients.length]
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold text-lg`}>
      {initials}
    </div>
  )
}

export default function TopCategories() {
  const { data: categories, isLoading } = useAllCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Lấy tất cả danh mục, không filter
  const displayedCategories = useMemo(() => {
    if (!categories) return []
    
    // Ưu tiên danh mục có ảnh lên đầu
    return [...categories].sort((a, b) => {
      const aHasImage = a.thumb ? 1 : 0
      const bHasImage = b.thumb ? 1 : 0
      return bHasImage - aHasImage
    }).slice(0, 24) // Giới hạn 24 danh mục để đỡ nặng
  }, [categories])

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
              <Grid3X3 className="text-blue-600" size={24} />
            </div>
            <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {[...Array(16)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-4 border border-blue-100">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">DANH MỤC SẢN PHẨM</span>
          </div>
        
          
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
          
          <p className="text-gray-500 text-center max-w-2xl mb-8">
            Khám phá  danh mục sản phẩm đa dạng và phong phú
          </p>

       
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {displayedCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  delay: index * 0.02,
                  duration: 0.3
                }
              }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              className="group"
              onMouseEnter={() => setSelectedCategory(cat.id)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              <Link
                href={`/san-pham?categoryId=${cat.id}`}
                className="flex flex-col items-center"
                prefetch={false}
              >
                {/* Image container */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                  {/* Image */}
                  <div className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                      : 'border-gray-200 group-hover:border-blue-300'
                  }`}>
                    <CategoryImage 
                      thumb={cat.thumb} 
                      name={cat.name} 
                      index={index}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Product count */}
                  {cat.productCount && cat.productCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white">
                      {cat.productCount > 99 ? '99+' : cat.productCount}
                    </div>
                  )}

                  {/* Badge không có ảnh */}
                  {!cat.thumb && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs flex items-center justify-center shadow-md">
                      <Hash size={8} />
                    </div>
                  )}
                </div>

                {/* Category name */}
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors line-clamp-2 px-1">
                    {cat.name}
                  </span>
                  {cat.productCount && cat.productCount > 0 && (
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {cat.productCount} sản phẩm
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Thông báo nếu có nhiều danh mục hơn hiển thị */}
        {categories.length > displayedCategories.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200"
          >
            <p className="text-gray-600 mb-2">
              Hiển thị {displayedCategories.length}/{categories.length} danh mục
            </p>
          </motion.div>
        )}

      

        {/* Quick categories cho mobile */}
        <div className="lg:hidden mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-700" />
              <h3 className="font-bold text-gray-900">Danh mục phổ biến</h3>
            </div>
            <Link 
              href="/danh-muc" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tất cả
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {displayedCategories
              .filter(cat => cat.productCount && cat.productCount > 50)
              .slice(0, 8)
              .map((cat) => (
              <Link
                key={cat.id}
                href={`/san-pham?categoryId=${cat.id}`}
                className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-blue-700 whitespace-nowrap">{cat.name}</span>
                {cat.productCount && (
                  <div className="text-xs text-blue-600 mt-0.5">{cat.productCount} sp</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}