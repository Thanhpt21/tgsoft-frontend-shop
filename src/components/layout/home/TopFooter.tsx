"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden my-10 mx-auto max-w-[calc(100vw-2rem)] sm:max-w-full">
      {/* Hình nền */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] z-0">
        <Image
          src="/image/topfooter.jpg"
          alt="Shop thời trang"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
        />
        {/* Overlay mờ đen */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Nội dung */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 z-10">
        <p className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
          Phong cách mới, mỗi mùa
        </p>
        <p className="text-gray-200 max-w-xl sm:max-w-2xl text-xs sm:text-sm md:text-base mb-4 sm:mb-6 px-2 leading-relaxed">
          Khám phá bộ sưu tập thời trang nam & nữ mới nhất. Từ trang phục thường
          ngày đến những outfit sành điệu, chúng tôi có tất cả để nâng tầm phong
          cách của bạn.
        </p>
        <button className="bg-[#ff5a5a] hover:bg-[#e04747] text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-xs sm:text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
          Mua ngay
        </button>
      </div>
    </section>
  );
}