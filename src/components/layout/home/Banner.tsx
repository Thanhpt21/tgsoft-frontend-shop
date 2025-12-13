"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  Shield,
  Truck,
  Gift,
  Tag,
  ShoppingBag,
  Heart,
  Zap,
  Clock,
  Award,
  Users,
  CheckCircle,
  TrendingDown,
  Package,
  CreditCard,
  RefreshCw,
  ShoppingCart,
  ArrowUpRight,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  ThumbsUp,
  Share2
} from "lucide-react";

// Fashion Hero Component - Minimalist Design
export default function FashionHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Minimal collections with no images
  const collections = [
    {
      id: 1,
      title: "BST Thu Đông 2024",
      subtitle: "Phong cách tối giản, thanh lịch",
      description: "Khám phá bộ sưu tập mới nhất với thiết kế tinh tế và chất liệu cao cấp",
      cta: "Khám phá ngay",
      bgColor: "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100",
      borderColor: "border-rose-200",
      textColor: "text-rose-900",
      accentColor: "bg-rose-500",
      icon: Sparkles,
      stats: "Đã bán 2,500+ sản phẩm"
    },
    {
      id: 2,
      title: "Thời trang công sở",
      subtitle: "Lịch lãm & Chuyên nghiệp",
      description: "Phong cách làm việc hiện đại với những thiết kế tinh tế và thoải mái",
      cta: "Mua sắm ngay",
      bgColor: "bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-900",
      accentColor: "bg-indigo-500",
      icon: Award,
      stats: "10K+ nhân viên văn phòng tin dùng"
    },
    {
      id: 3,
      title: "Phụ kiện thời thượng",
      subtitle: "Điểm nhấn hoàn hảo",
      description: "Từ túi xách đến trang sức - hoàn thiện phong cách của bạn",
      cta: "Xem phụ kiện",
      bgColor: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
      borderColor: "border-amber-200",
      textColor: "text-amber-900",
      accentColor: "bg-amber-500",
      icon: Package,
      stats: "500+ mẫu phụ kiện độc đáo"
    }
  ];

  // Hero features
  const features = [
    {
      icon: Truck,
      title: "Miễn phí vận chuyển",
      description: "Cho đơn hàng từ 500K",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Shield,
      title: "Bảo hành chất lượng",
      description: "30 ngày đổi trả",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Gift,
      title: "Quà tặng đặc biệt",
      description: "Tặng voucher 100K",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Clock,
      title: "Giao hàng nhanh",
      description: "Trong 2 giờ nội thành",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  // Trending styles
  const trendingStyles = [
    {
      name: "Minimalist",
      trend: "+15%",
      icon: TrendingUp,
      color: "from-gray-900 to-gray-700"
    },
    {
      name: "Streetwear",
      trend: "+28%",
      icon: TrendingUp,
      color: "from-rose-600 to-pink-600"
    },
    {
      name: "Business Casual",
      trend: "+12%",
      icon: TrendingUp,
      color: "from-blue-600 to-indigo-600"
    },
    {
      name: "Vintage",
      trend: "+5%",
      icon: TrendingDown,
      color: "from-emerald-600 to-green-600"
    }
  ];

  // Stats data
  const stats = [
    { label: "Thiết kế độc quyền", value: "500+", color: "text-rose-600" },
    { label: "Khách hàng hài lòng", value: "10K+", color: "text-indigo-600" },
    { label: "Đánh giá 5 sao", value: "98%", color: "text-emerald-600" },
    { label: "Xuất xứ chất lượng", value: "100%", color: "text-amber-600" }
  ];

  // Auto rotation
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % collections.length);
  }, [collections.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length)
  }, [collections.length]);

  // Auto-rotate with pause on hover
  useEffect(() => {
    if (isHovered) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovered, nextSlide]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const currentCollection = collections[currentIndex];
  const Icon = currentCollection.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Geometric background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="grid grid-cols-12 gap-0 opacity-10">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="aspect-square border border-gray-300" />
            ))}
          </div>
        </div>
      </div>

      {/* Main hero content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content - Text & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-black rounded-full text-white font-medium shadow-lg">
              <Sparkles size={14} className="fill-white" />
              <span>THỜI TRANG CAO CẤP</span>
            </div>

            {/* Main title - Typography focused */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  PHONG CÁCH
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ĐẲNG CẤP
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  CHO BẠN
                </span>
              </h1>
              
              {/* Decorative line */}
              <div className="flex items-center gap-4">
                <div className="h-1 w-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                <div className="h-1 w-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                <div className="h-1 w-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              Khám phá thế giới thời trang tinh tế với những thiết kế độc đáo, 
              chất liệu cao cấp và phong cách cá nhân hóa.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>


           
          </motion.div>

          {/* Right content - Collections showcase (no images) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Collections showcase */}
            <div className="relative h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCollection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 ${currentCollection.bgColor} rounded-2xl border-2 ${currentCollection.borderColor} shadow-2xl overflow-hidden`}
                >
                  {/* Collection content */}
                  <div className="p-8 h-full flex flex-col">
                    {/* Icon and badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Icon className={currentCollection.textColor} size={28} />
                      </div>
                      <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium shadow-sm">
                        {currentCollection.stats}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium mb-4">
                          <div className="w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                          BỘ SƯU TẬP
                        </div>
                        <h3 className="text-3xl font-bold mb-3 leading-tight">
                          <span className={currentCollection.textColor}>
                            {currentCollection.title}
                          </span>
                        </h3>
                        <p className="text-lg opacity-90 mb-2">
                          {currentCollection.subtitle}
                        </p>
                        <p className="text-gray-600">
                          {currentCollection.description}
                        </p>
                      </div>

                      {/* Features list */}
                      <div className="space-y-3 mb-8">
                        {["✔ Thiết kế độc quyền", "✔ Chất liệu cao cấp", "✔ Size đa dạng"].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                     
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-4 right-4">
                      <div className="text-6xl font-black opacity-10 select-none">
                        {currentCollection.id.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation dots */}
              {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {collections.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'w-8 bg-gradient-to-r from-gray-900 to-black' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to collection ${idx + 1}`}
                  />
                ))}
              </div> */}

              {/* Next/Prev buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 text-gray-700 transition-all duration-300 flex items-center justify-center shadow-lg z-20"
                aria-label="Previous collection"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 text-gray-700 transition-all duration-300 flex items-center justify-center shadow-lg z-20"
                aria-label="Next collection"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Trending alert badge */}
            <div className="absolute -top-3 -right-3 z-10">
              <div className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg shadow-lg transform rotate-3 animate-pulse">
                TRENDING
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid - Mobile 2 col */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 md:mt-16 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="group bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md md:hover:shadow-xl transition-all duration-300"
          >
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl ${feature.bgColor} flex items-center justify-center mb-3 md:mb-5 group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className={feature.color} size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-lg leading-tight">{feature.title}</h3>
            <p className="text-gray-500 text-xs md:text-sm md:text-base">{feature.description}</p>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-400">Dịch vụ</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

        {/* Trending styles section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">XU HƯỚNG HIỆN TẠI</h3>
              <p className="text-gray-600">Các phong cách đang thịnh hành</p>
            </div>
            <button className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-2">
              Xem tất cả
              <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trendingStyles.map((style, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-gray-900">{style.name}</div>
                  <div className={`text-sm font-bold bg-gradient-to-r ${style.color} bg-clip-text text-transparent`}>
                    {style.trend}
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${parseInt(style.trend)}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-gradient-to-r ${style.color} rounded-full`}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>Mức độ phổ biến</span>
                  <style.icon size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

    </section>
  );
}