"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden my-10">
      {/* Hình nền */}
      <div className="relative w-full h-[500px] z-0">
        <Image
          src="/image/topfooter.jpg"
          alt="Shop thời trang"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay mờ đen */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Nội dung */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <p className="text-white text-3xl sm:text-5xl font-bold mb-4">
          Phong cách mới, mỗi mùa
        </p>
        <p className="text-gray-200 max-w-2xl text-sm sm:text-base mb-6">
          Khám phá bộ sưu tập thời trang nam & nữ mới nhất. Từ trang phục thường
          ngày đến những outfit sành điệu, chúng tôi có tất cả để nâng tầm phong
          cách của bạn.
        </p>
        <button className="bg-[#ff5a5a] hover:bg-[#e04747] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg">
          Mua ngay
        </button>
      </div>
    </section>
  );
}
