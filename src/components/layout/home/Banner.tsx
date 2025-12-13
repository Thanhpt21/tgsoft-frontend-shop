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
  Zap
} from "lucide-react";

// Fashion Hero Component
export default function FashionHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fashion collections với hình ảnh chất lượng cao
  const collections = [
    {
      id: 1,
      title: "BST Thu Đông 2024",
      subtitle: "Phong cách tối giản, thanh lịch",
      description: "Khám phá bộ sưu tập mới nhất với thiết kế tinh tế và chất liệu cao cấp",
      cta: "Khám phá ngay",
      bgColor: "from-rose-50 to-pink-50",
      textColor: "text-rose-900",
      accentColor: "bg-rose-500",
      image: "/api/placeholder/1200/600"
    },
    {
      id: 2,
      title: "Thời trang công sở",
      subtitle: "Lịch lãm & Chuyên nghiệp",
      description: "Phong cách làm việc hiện đại với những thiết kế tinh tế và thoải mái",
      cta: "Mua sắm ngay",
      bgColor: "from-indigo-50 to-blue-50",
      textColor: "text-indigo-900",
      accentColor: "bg-indigo-500",
      image: "/api/placeholder/1200/600"
    },
    {
      id: 3,
      title: "Phụ kiện thời thượng",
      subtitle: "Điểm nhấn hoàn hảo",
      description: "Từ túi xách đến trang sức - hoàn thiện phong cách của bạn",
      cta: "Xem phụ kiện",
      bgColor: "from-amber-50 to-orange-50",
      textColor: "text-amber-900",
      accentColor: "bg-amber-500",
      image: "/api/placeholder/1200/600"
    }
  ];

  // Hero features
  const features = [
    {
      icon: Truck,
      title: "Miễn phí vận chuyển",
      description: "Cho đơn hàng từ 500K"
    },
    {
      icon: Shield,
      title: "Bảo hành chất lượng",
      description: "30 ngày đổi trả"
    },
    {
      icon: Gift,
      title: "Quà tặng đặc biệt",
      description: "Tặng voucher 100K"
    },
    {
      icon: TrendingUp,
      title: "Xu hướng mới nhất",
      description: "Cập nhật hàng tuần"
    }
  ];

  // Auto rotation
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % collections.length);
  }, [collections.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[size:40px_40px]" />
      </div>

      {/* Main hero content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content - Text & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-white font-medium">
              <Sparkles size={14} className="fill-white" />
              <span>NEW COLLECTION</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Phong cách
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Thời thượng
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Cho bạn
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-xl">
              Khám phá bộ sưu tập thời trang cao cấp với thiết kế tinh tế, 
              chất liệu đẳng cấp và phong cách độc đáo.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-gray-500">Thiết kế độc quyền</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-gray-500">Khách hàng hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-sm text-gray-500">Đánh giá 5 sao</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/san-pham")}
                className="px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <ShoppingBag size={20} />
                <span>Mua sắm ngay</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/khuyen-mai")}
                className="px-8 py-4 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-semibold rounded-lg border-2 border-rose-200 hover:border-rose-300 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Tag size={20} />
                <span>Ưu đãi đặc biệt</span>
              </motion.button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
                <Heart size={16} />
                <span>Yêu thích</span>
              </button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
                <Zap size={16} />
                <span>Mới về</span>
              </button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors">
                <Star size={16} />
                <span>Bán chạy</span>
              </button>
            </div>
          </motion.div>

          {/* Right content - Image & Collections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Main image showcase */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentCollection.bgColor}`} />
              
              {/* Image placeholder - In production, replace with actual image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">👗</div>
                      <p className="text-gray-700 font-medium">BST {currentCollection.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent p-8 flex flex-col justify-end">
                <motion.div
                  key={currentCollection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
                >
                  <h3 className="text-2xl font-bold mb-2">{currentCollection.title}</h3>
                  <p className="text-white/90 mb-4">{currentCollection.subtitle}</p>
                  <button
                    onClick={() => router.push("/san-pham")}
                    className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2 group"
                  >
                    {currentCollection.cta}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {collections.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'w-6 bg-white' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to collection ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next/Prev buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Previous collection"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Next collection"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4">
              <div className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-lg shadow-lg transform rotate-3">
                -30% OFF
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-rose-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trend alert */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 rounded-xl p-6 border border-rose-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Xu hướng nổi bật tuần này</h4>
                <p className="text-sm text-gray-600">Minimalist style đang thống trị mùa thu 2024</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/xu-huong")}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
            >
              <span>Khám phá xu hướng</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full opacity-20 blur-3xl" />
    </section>
  );
}