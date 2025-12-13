'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useAllCategories } from '@/hooks/category/useAllCategories'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  ChevronRight, 
  Search, 
  Tag,
  Grid3X3,
  Loader2,
  TrendingUp,
  Filter
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
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

// Progressive Image Component
const CategoryImage = ({ 
  src, 
  alt,
  isLoading 
}: { 
  src: string; 
  alt: string;
  isLoading: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src || isLoading) return
    
    const img = new window.Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setError(true)
  }, [src, isLoading])

  if (isLoading || !isLoaded || error) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full animate-pulse" />
    )
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  )
}

// Intersection Observer Hook
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1,
        ...options 
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])

  return { ref, isInView }
}

export default function TopCategories() {
  const { data: categories, isLoading } = useAllCategories()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  
  const sectionRef = useRef<HTMLDivElement>(null)

  // Get image URL function
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '/images/no-image.png'
    return path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`
  }

  // Filter và sort categories
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    
    let filtered = [...categories]
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort based on active filter
    switch (activeFilter) {
      case 'popular':
        filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        // Assuming newer categories have higher IDs
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        // Default sort - maybe by product count
        filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
    }
    
    return filtered.slice(0, 24) // Limit to 24 categories max
  }, [categories, searchQuery, activeFilter])

  // Preload images khi component mount
  useEffect(() => {
    if (!categories || categories.length === 0) return

    // Preload first 8 images immediately
    categories.slice(0, 8).forEach((cat: any) => {
      if (cat.thumb) {
        const img = new window.Image()
        img.src = getImageUrl(cat.thumb)
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(cat.thumb!))
        }
      }
    })

    // Lazy load rest khi scroll
    const lazyLoadImages = () => {
      categories.slice(8).forEach((cat: any)  => {
        if (cat.thumb && !loadedImages.has(cat.thumb)) {
          const img = new window.Image()
          img.src = getImageUrl(cat.thumb)
          img.onload = () => {
            setLoadedImages(prev => new Set(prev).add(cat.thumb!))
          }
        }
      })
    }

    // Sử dụng Intersection Observer cho lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lazyLoadImages()
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [categories, loadedImages])

  // Loading state đẹp
  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-12 bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4 animate-pulse">
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
    <section ref={sectionRef} className="py-12 bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header với animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-4 border border-blue-100">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">KHÁM PHÁ NGAY</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 text-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Danh mục sản phẩm
            </span>
          </h1>
          
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
          
          <p className="text-gray-500 text-center max-w-2xl mb-6">
            Khám phá hàng ngàn sản phẩm chất lượng trong các danh mục đa dạng
          </p>

          {/* Search và filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl mb-8">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Lọc</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
              
              {/* Filter options dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-10 opacity-0 hover:opacity-100 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
                {[
                  { id: 'all', label: 'Tất cả', icon: '📊' },
                  { id: 'popular', label: 'Phổ biến', icon: '🔥' },
                  { id: 'name', label: 'A-Z', icon: '🔤' },
                  { id: 'newest', label: 'Mới nhất', icon: '🆕' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeFilter === filter.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-100 mb-6"
          >
            <Tag size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {filteredCategories.length} danh mục
            </span>
          </motion.div>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          <AnimatePresence mode="wait">
            {filteredCategories.map((cat, index) => {
              const imageUrl = cat.thumb ? getImageUrl(cat.thumb) : '/images/no-image.png'
              const isImageLoaded = loadedImages.has(cat.thumb || '') || !cat.thumb
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: {
                      delay: index * 0.05,
                      duration: 0.4,
                      ease: "easeOut"
                    }
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                  onMouseEnter={() => setSelectedCategory(cat.id)}
                  onMouseLeave={() => setSelectedCategory(null)}
                >
                  <Link
                    href={`/san-pham?categoryId=${cat.id}`}
                    className="flex flex-col items-center cursor-pointer relative"
                  >
                    {/* Category image container */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                      {/* Outer ring */}
                      <div className={`absolute -inset-2 rounded-full transition-all duration-500 ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-sm'
                          : 'bg-transparent'
                      }`} />
                      
                      {/* Image container */}
                      <motion.div
                        className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-300 ${
                          selectedCategory === cat.id
                            ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                            : 'border-gray-200 group-hover:border-blue-300'
                        }`}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {/* Image loading */}
                        {isImageLoaded ? (
                          <motion.img
                            src={imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                        )}
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Product count badge */}
                        {cat.productCount && cat.productCount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg"
                          >
                            {cat.productCount > 99 ? '99+' : cat.productCount}
                          </motion.div>
                        )}
                      </motion.div>
                      
                      {/* Active indicator */}
                      {selectedCategory === cat.id && (
                        <motion.div
                          layoutId="activeCategory"
                          className="absolute -inset-1 rounded-full border-2 border-blue-500"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>

                    {/* Category name */}
                    <div className="relative">
                      <span className="text-center text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors line-clamp-1">
                        {cat.name}
                      </span>
                      
                      {/* Hover underline effect */}
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* View all categories button */}
        {categories.length > filteredCategories.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-10"
          >
            <Link
              href="/danh-muc"
              className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              <span>Xem tất cả danh mục</span>
              <ChevronRight 
                size={18} 
                className="group-hover:translate-x-1 transition-transform" 
              />
            </Link>
          </motion.div>
        )}

        {/* Loading indicator cho lazy images */}
        {loadedImages.size < categories.length && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-gray-500">Đang tải thêm danh mục...</span>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .category-image {
          content-visibility: auto;
        }
      `}</style>
    </section>
  )
}