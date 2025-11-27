"use client";

import {
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AboutUsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const values = [
    {
      icon: <CheckCircleOutlined />,
      title: "Chất lượng",
      description:
        "Cam kết mang đến sản phẩm chất lượng cao nhất cho khách hàng.",
    },
    {
      icon: <TrophyOutlined />,
      title: "Uy tín",
      description: "Xây dựng niềm tin qua từng giao dịch và dịch vụ.",
    },
    {
      icon: <TeamOutlined />,
      title: "Tận tâm",
      description:
        "Đội ngũ chuyên nghiệp, luôn lắng nghe và hỗ trợ khách hàng tốt nhất.",
    },
    {
      icon: <RocketOutlined />,
      title: "Đổi mới",
      description:
        "Không ngừng cải tiến và phát triển để phục vụ tốt hơn mỗi ngày.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Khách hàng" },
    { number: "500+", label: "Sản phẩm" },
    { number: "50+", label: "Đối tác" },
    { number: "99%", label: "Hài lòng" },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Trang chủ
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Giới thiệu</span>
          </div>
        </div>
      </div>
      {/* Main container - giống width Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm border border-blue-200/50">
            <RocketOutlined className="text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Về chúng tôi
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hành trình của TGSOFT
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nơi đam mê công nghệ và sự tận tâm giao thoa để mang lại giá trị tốt
            nhất cho khách hàng.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi khởi đầu với khát vọng mang đến những sản phẩm và dịch
              vụ công nghệ chất lượng, giúp doanh nghiệp Việt vươn mình mạnh mẽ
              hơn trong kỷ nguyên số.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Với đội ngũ trẻ trung, sáng tạo và tận tâm, TGSOFT không ngừng học
              hỏi, cải tiến và đổi mới mỗi ngày để đáp ứng nhu cầu khách hàng
              một cách tốt nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <span>Giải pháp toàn diện</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <span>Dịch vụ tận tâm</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative group h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100">
            <Image
              src="/image/about.jpg"
              alt="Giới thiệu TGSOFT"
              fill
              priority
              style={{ objectFit: "cover" }}
              className="group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-8 text-center hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mb-4 backdrop-blur-sm border border-purple-200/50">
              <TrophyOutlined className="text-purple-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Giá trị cốt lõi
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Những điều chúng tôi trân quý
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đó là nền tảng giúp TGSOFT không ngừng phát triển và tạo nên giá
              trị bền vững.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-8 hover:border-blue-300 hover:shadow-2xl transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
