"use client";

import {
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  StarOutlined,
  GlobalOutlined,
  HeartOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Typography } from "antd";

const { Title, Text } = Typography;

// Core value component
const ValueCard = ({ icon: Icon, title, description, color, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group"
  >
    <div className="relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 group-hover:border-blue-300 transition-all duration-500" />
      <div className="relative p-6 sm:p-8 flex flex-col h-full">
        <div className="mb-6">
          <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
        <Title level={4} className="!mb-3 !text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </Title>
        <Text className="text-gray-600 leading-relaxed flex-1">{description}</Text>
        <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-blue-200 transition-colors">
          <Text className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Giá trị cốt lõi
          </Text>
        </div>
      </div>
    </div>
  </motion.div>
);

// Stat card component
const StatCard = ({ number, label, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="group"
  >
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-8 text-center hover:shadow-2xl hover:border-blue-300 transition-all duration-500 h-full">
      <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
        {number}
      </div>
      <div className="text-gray-900 font-bold text-xl mb-2">{label}</div>
      {description && (
        <Text className="text-gray-500 text-sm">{description}</Text>
      )}
      <div className="mt-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto group-hover:w-16 transition-all duration-300" />
    </div>
  </motion.div>
);

export default function AboutUsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: CheckCircleOutlined,
      title: "Chất lượng xuất sắc",
      description: "Cam kết mang đến sản phẩm và dịch vụ chất lượng cao nhất với tiêu chuẩn quốc tế.",
      color: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      icon: TrophyOutlined,
      title: "Uy tín hàng đầu",
      description: "Xây dựng niềm tin bền vững qua từng giao dịch minh bạch và trách nhiệm.",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600"
    },
    {
      icon: TeamOutlined,
      title: "Tận tâm phục vụ",
      description: "Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng hỗ trợ 24/7.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: RocketOutlined,
      title: "Đổi mới liên tục",
      description: "Không ngừng cải tiến và áp dụng công nghệ tiên tiến nhất.",
      color: "bg-gradient-to-br from-purple-500 to-pink-600"
    },
    {
      icon: GlobalOutlined,
      title: "Tầm nhìn toàn cầu",
      description: "Mang giải pháp Việt vươn tầm quốc tế, đáp ứng tiêu chuẩn toàn cầu.",
      color: "bg-gradient-to-br from-sky-500 to-blue-600"
    },
    {
      icon: HeartOutlined,
      title: "Trách nhiệm xã hội",
      description: "Phát triển bền vững với môi trường và cộng đồng là trọng tâm.",
      color: "bg-gradient-to-br from-red-500 to-pink-600"
    }
  ];

  const stats = [
    { 
      number: "5+", 
      label: "Năm kinh nghiệm", 
      description: "Đồng hành cùng hàng nghìn khách hàng" 
    },
    { 
      number: "500+", 
      label: "Dự án thành công", 
      description: "Giải pháp toàn diện cho doanh nghiệp" 
    },
    { 
      number: "50+", 
      label: "Đối tác chiến lược", 
      description: "Hợp tác với các tập đoàn hàng đầu" 
    },
    { 
      number: "99%", 
      label: "Khách hàng hài lòng", 
      description: "Tỷ lệ phản hồi tích cực" 
    },
  ];

  const timeline = [
    { year: "2019", event: "Thành lập công ty", description: "Khởi đầu với đội ngũ 5 thành viên" },
    { year: "2020", event: "Phát triển sản phẩm", description: "Ra mắt phiên bản đầu tiên" },
    { year: "2021", event: "Mở rộng thị trường", description: "Hợp tác với 20+ đối tác" },
    { year: "2022", event: "Đột phá công nghệ", description: "Áp dụng AI và Blockchain" },
    { year: "2023", event: "Vươn tầm quốc tế", description: "Mở rộng ra thị trường Đông Nam Á" },
    { year: "2024", event: "Định hướng tương lai", description: "Tiên phong trong chuyển đổi số" },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Text className="text-gray-600">Đang tải trang giới thiệu...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Trang chủ
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">Giới thiệu</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6 backdrop-blur-sm border border-blue-200/50">
              <RocketOutlined className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Câu chuyện của chúng tôi</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                TGSOFT - Đồng hành cùng sự phát triển
              </span>
            </h1>
            
            <Text className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto block mb-8">
              Từ khát vọng đưa công nghệ Việt vươn tầm thế giới, chúng tôi không ngừng sáng tạo và cam kết mang đến những giải pháp tối ưu nhất cho doanh nghiệp.
            </Text>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-sm font-medium">Giải pháp toàn diện</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-sm font-medium">Công nghệ tiên tiến</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-sm font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 pb-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Title level={2} className="!mb-6 !text-gray-900">
              Hành trình phát triển
            </Title>
            <Text className="text-gray-600 leading-relaxed text-lg">
              Được thành lập với sứ mệnh trở thành đối tác công nghệ tin cậy hàng đầu, TGSOFT đã không ngừng phát triển và khẳng định vị thế trong ngành công nghệ thông tin.
            </Text>
            <Text className="text-gray-600 leading-relaxed">
              Với đội ngũ chuyên gia giàu kinh nghiệm và đam mê sáng tạo, chúng tôi cam kết mang đến những giải pháp công nghệ tối ưu, giúp doanh nghiệp nâng cao hiệu quả hoạt động và tăng trưởng bền vững.
            </Text>
            <div className="pt-6">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <BulbOutlined className="text-yellow-500 text-xl" />
                <span className="font-semibold">Sứ mệnh của chúng tôi</span>
              </div>
              <Text className="text-gray-600 pl-8">
                Cung cấp giải pháp công nghệ tiên tiến, giúp khách hàng tối ưu hóa hiệu quả kinh doanh và vươn tầm quốc tế.
              </Text>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-96 lg:h-full rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/image/about.jpg"
                alt="Văn phòng TGSOFT"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full backdrop-blur-sm border border-purple-200/50 mb-4">
              <TrophyOutlined className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Thành tựu nổi bật</span>
            </div>
            <Title level={2} className="!mb-4 !text-gray-900">
              Những con số ấn tượng
            </Title>
            <Text className="text-gray-600 max-w-2xl mx-auto">
              Hành trình phát triển của chúng tôi được đánh dấu bằng những thành tựu đáng tự hào
            </Text>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                label={stat.label}
                description={stat.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full backdrop-blur-sm border border-blue-200/50 mb-4">
              <StarOutlined className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Hành trình phát triển</span>
            </div>
            <Title level={2} className="!mb-4 !text-gray-900">
              Chặng đường đã qua
            </Title>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block" />
            
            <div className="space-y-8 md:space-y-0">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white shadow-lg z-10 hidden md:block" />
                  
                  {/* Content */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{item.year}</span>
                        </div>
                        <Title level={4} className="!mb-0 !text-gray-900">{item.event}</Title>
                      </div>
                      <Text className="text-gray-600">{item.description}</Text>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full backdrop-blur-sm border border-green-200/50 mb-4">
              <HeartOutlined className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Giá trị cốt lõi</span>
            </div>
            <Title level={2} className="!mb-4 !text-gray-900">
              Điều làm nên TGSOFT
            </Title>
            <Text className="text-gray-600 max-w-3xl mx-auto">
              Những giá trị này là nền tảng cho mọi quyết định và hành động của chúng tôi
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <ValueCard
                key={index}
                {...value}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <Title level={3} className="!mb-4 !text-white">
              Sẵn sàng hợp tác cùng chúng tôi?
            </Title>
            <Text className="text-white/90 text-lg mb-8 block max-w-2xl mx-auto">
              Hãy để TGSOFT đồng hành cùng bạn trên hành trình chuyển đổi số và phát triển bền vững.
            </Text>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg">
                Liên hệ ngay
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300">
                Xem dự án
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}