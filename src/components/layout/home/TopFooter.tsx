"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 max-w-7xl my-16">
      <div className="relative w-full rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
        {/* Hình nền */}
        <Image
          src="/image/topfooter.jpg"
          alt="Banner promotion"
          fill
          className="object-cover"
        />
        {/* Overlay gradient đen để dễ đọc chữ */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

        {/* Nội dung căn trái */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
          <p className="text-white/80 font-medium tracking-widest text-sm uppercase mb-2">
            New Collection
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Phong cách thời thượng <br/> Dẫn đầu xu hướng
          </h2>
          <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md leading-relaxed">
            Khám phá bộ sưu tập mới nhất với ưu đãi đặc biệt dành riêng cho thành viên trong tháng này.
          </p>
          <div>
            <Link href="/san-pham">
              <button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg text-sm transition-colors duration-200">
                Mua ngay
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}