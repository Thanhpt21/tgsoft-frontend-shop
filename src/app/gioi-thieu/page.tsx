// app/gioi-thieu/page.tsx
'use client';

import { CheckCircleOutlined, TrophyOutlined, TeamOutlined, RocketOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AboutUsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: <CheckCircleOutlined />,
      title: 'Chất lượng',
      description: 'Cam kết mang đến sản phẩm chất lượng cao nhất cho khách hàng'
    },
    {
      icon: <TrophyOutlined />,
      title: 'Uy tín',
      description: 'Xây dựng niềm tin qua từng giao dịch và dịch vụ'
    },
    {
      icon: <TeamOutlined />,
      title: 'Tận tâm',
      description: 'Đội ngũ chuyên nghiệp, luôn lắng nghe và hỗ trợ tốt nhất'
    },
    {
      icon: <RocketOutlined />,
      title: 'Đổi mới',
      description: 'Không ngừng cải tiến và phát triển để phục vụ tốt hơn'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Khách hàng' },
    { number: '500+', label: 'Sản phẩm' },
    { number: '50+', label: 'Đối tác' },
    { number: '99%', label: 'Hài lòng' }
  ];

  const team = [
    { name: 'Nguyễn Văn A', role: 'CEO & Founder' },
    { name: 'Trần Thị B', role: 'Marketing Director' },
    { name: 'Lê Văn C', role: 'Product Manager' },
    { name: 'Phạm Thị D', role: 'Customer Success' }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Về chúng tôi
            </h1>
            <p className="text-lg sm:text-xl opacity-90 leading-relaxed">
              Chào mừng bạn đến với câu chuyện của chúng tôi. Nơi đam mê, chất lượng và sự tận tâm hòa quyện để tạo nên trải nghiệm tuyệt vời nhất cho bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Câu chuyện của chúng tôi
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Hành trình tạo nên sự khác biệt
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Chúng tôi bắt đầu với một ý tưởng đơn giản: mang đến những sản phẩm chất lượng cao với dịch vụ tận tâm nhất. Từ những ngày đầu khiêm tốn, chúng tôi đã không ngừng phát triển và hoàn thiện.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Ngày nay, chúng tôi tự hào là đối tác tin cậy của hàng nghìn khách hàng, luôn đặt sự hài lòng của bạn lên hàng đầu trong mọi quyết định.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <span>Sản phẩm chính hãng 100%</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
              <div className="relative rounded-2xl h-96 lg:h-[500px] overflow-hidden shadow-2xl">
                <Image
                  src="/image/about.jpg"
                  alt="Về chúng tôi"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold mb-4">
            Giá trị cốt lõi
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Những gì chúng tôi tin tưởng
          </h2>
          <p className="text-gray-600">
            Giá trị định hướng mọi hành động và quyết định của chúng tôi
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div 
              key={index}
              className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>


     
    </div>
  );
}