"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Clock, Tag } from "lucide-react";

// Banner data - có thể mở rộng thành carousel
const banners = [
  {
    id: 1,
    image: "/image/topfooter.jpg",
    title: "Phong cách thời thượng",
    subtitle: "Dẫn đầu xu hướng",
    description: "Khám phá bộ sưu tập mới nhất với ưu đãi đặc biệt dành riêng cho thành viên trong tháng này.",
    badge: "New Collection",
    buttonText: "Mua ngay",
    link: "/san-pham",
    gradient: "from-blue-900/80 via-purple-900/40 to-transparent",
    color: "text-white"
  },
  {
    id: 2,
    image: "/image/banner-2.jpg",
    title: "Giảm giá sốc",
    subtitle: "Lên đến 50%",
    description: "Ưu đãi đặc biệt cuối năm. Mua sắm ngay để không bỏ lỡ!",
    badge: "Flash Sale",
    buttonText: "Xem ngay",
    link: "/san-pham?hasPromotion=true",
    gradient: "from-red-900/80 via-orange-900/40 to-transparent",
    color: "text-white"
  },
  {
    id: 3,
    image: "/image/banner-3.jpg",
    title: "Premium Collection",
    subtitle: "Chất lượng đỉnh cao",
    description: "Sản phẩm cao cấp, thiết kế tinh tế dành cho người sành điệu.",
    badge: "Premium",
    buttonText: "Khám phá",
    link: "/san-pham?isFeatured=true",
    gradient: "from-gray-900/80 via-slate-900/40 to-transparent",
    color: "text-white"
  }
];

// Promo countdown component
const PromoCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 backdrop-blur-sm bg-opacity-90 rounded-xl p-3 shadow-2xl border border-red-400/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Kết thúc sau:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="bg-black/30 rounded-lg px-2 py-1 min-w-[40px]">
                <span className="text-white font-bold text-lg">{timeLeft.hours.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white/80 text-xs">Giờ</span>
            </div>
            <span className="text-white font-bold">:</span>
            <div className="text-center">
              <div className="bg-black/30 rounded-lg px-2 py-1 min-w-[40px]">
                <span className="text-white font-bold text-lg">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white/80 text-xs">Phút</span>
            </div>
            <span className="text-white font-bold">:</span>
            <div className="text-center">
              <div className="bg-black/30 rounded-lg px-2 py-1 min-w-[40px]">
                <span className="text-white font-bold text-lg">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white/80 text-xs">Giây</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats component
const HeroStats = () => (
  <div className="absolute top-4 left-4 z-20">
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="flex items-center gap-1 text-white">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">100K+</span>
          </div>
          <span className="text-white/80 text-xs">Sản phẩm</span>
        </div>
        <div className="w-px h-6 bg-white/30" />
        <div className="text-center">
          <div className="flex items-center gap-1 text-white">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">5★</span>
          </div>
          <span className="text-white/80 text-xs">Đánh giá</span>
        </div>
        <div className="w.px h-6 bg-white/30" />
        <div className="text-center">
          <div className="flex items-center gap-1 text-white">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">50+</span>
          </div>
          <span className="text-white/80 text-xs">Thương hiệu</span>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto rotate banners
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const banner = banners[currentBanner];

  return (
    <section className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0">
        <div 
          className="relative w-full rounded-3xl overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background image with parallax effect */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
              quality={85}
            />
          </motion.div>

          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
          
          {/* Additional gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[2px] h-[2px] bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  opacity: 0 
                }}
                animate={{ 
                  y: ["0%", "-100%"],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          {/* Hero Stats */}
          <HeroStats />

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-16 xl:px-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl space-y-6"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm tracking-wider">
                    {banner.badge}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${banner.color}`}
                >
                  {banner.title}
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {banner.subtitle}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-200 text-lg md:text-xl max-w-xl leading-relaxed"
                >
                  {banner.description}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  <Link href={banner.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center gap-2">
                        {banner.buttonText}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12" />
                    </motion.button>
                  </Link>

                  <Link href="/san-pham">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group bg-transparent border-2 border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-2">
                        Xem tất cả
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-6 pt-8"
                >
                  {["Miễn phí vận chuyển", "Đổi trả 30 ngày", "Bảo hành chính hãng", "Hỗ trợ 24/7"].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-white/90 text-sm">{feature}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Decorative elements */}
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
              </div>
            </div>
          </div>

          {/* Promo Countdown */}
          <PromoCountdown />

          {/* Banner navigation dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentBanner === index
                      ? 'bg-white w-10'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm mb-2">Scroll</span>
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                  <motion.div
                    animate={{ y: [0, 16, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1 h-3 bg-white rounded-full mt-2"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Responsive grid below hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Sản phẩm mới
            </h3>
            <p className="text-gray-600 text-sm">Cập nhật hàng tuần</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Ưu đãi đặc biệt
            </h3>
            <p className="text-gray-600 text-sm">Giảm đến 50%</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              Bán chạy nhất
            </h3>
            <p className="text-gray-600 text-sm">Top sản phẩm</p>
          </div>
        </div>
      </div>
    </section>
  );
}