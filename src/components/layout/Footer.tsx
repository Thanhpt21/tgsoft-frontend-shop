"use client";

import Link from "next/link";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  GlobalOutlined,
  SendOutlined,
  RightOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Input, Button } from "antd";
import { Config } from "@/types/config.type";
import { useState } from "react";

interface FooterProps {
  config: Config;
}

const Footer = ({ config }: FooterProps) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    setEmail("");
  };

  const socialLinks = [
    {
      icon: <FacebookOutlined />,
      url: config.facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      label: "Facebook",
    },
    {
      icon: <TwitterOutlined />,
      url: config.x,
      color: "bg-sky-500 hover:bg-sky-600",
      label: "Twitter",
    },
    {
      icon: <InstagramOutlined />,
      url: config.instagram,
      color:
        "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      label: "Instagram",
    },
    {
      icon: <YoutubeOutlined />,
      url: config.youtube,
      color: "bg-red-600 hover:bg-red-700",
      label: "Youtube",
    },
  ].filter((link) => link.url);

  const features = [
    {
      icon: <ShoppingOutlined />,
      title: "Miễn phí vận chuyển",
      desc: "Đơn hàng từ 500K",
    },
    {
      icon: <SafetyOutlined />,
      title: "Thanh toán an toàn",
      desc: "Bảo mật 100%",
    },
    {
      icon: <HeartOutlined />,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn nhiệt tình",
    },
    {
      icon: <StarOutlined />,
      title: "Đổi trả dễ dàng",
      desc: "Trong vòng 7 ngày",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-white">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Features Bar */}
      <div className="relative border-b border-gray-300/20 backdrop-blur-sm bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-800 font-bold text-sm mb-0.5">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Company Info & Contact */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {config.name || "Your Brand"}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng
              </p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200 hover:bg-gray-200 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <PhoneOutlined className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Hotline hỗ trợ</p>
                  <p className="text-gray-400 text-xs">
                    08:30 - 22:00 hàng ngày
                  </p>
                </div>
              </div>
              <a
                href={`tel:${config.mobile}`}
                className="block text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent hover:from-emerald-400 hover:to-green-400 transition-all"
              >
                {config.mobile || "0963 646 444"}
              </a>
            </div>

            <div>
              <h6 className="text-gray-800 font-bold mb-4 text-sm flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
                Kết nối với chúng tôi
              </h6>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                    >
                      <span className="text-white text-xl">{link.icon}</span>
                    </div>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h6 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
              Về chúng tôi
            </h6>
            <ul className="space-y-3">
              {[
                { label: "Giới thiệu", href: "/gioi-thieu" },
                { label: "Sản phẩm", href: "/san-pham" },
                { label: "Tin tức", href: "/tin-tuc" },
                { label: "Liên hệ", href: "/lien-he" },
                { label: "Tuyển dụng", href: "/tuyen-dung" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <RightOutlined className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h6 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
              Chính sách & Hỗ trợ
            </h6>
            <ul className="space-y-3 mb-8">
              {[
                { label: "Hướng dẫn chọn size", href: "/huong-dan-chon-size" },
                {
                  label: "Khách hàng thân thiết",
                  href: "/chinh-sach-khach-hang-than-thiet",
                },
                { label: "Câu hỏi thường gặp", href: "/cau-hoi-thuong-gap" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <RightOutlined className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Info */}
          <div>
            <h6 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
              Đăng ký nhận tin
            </h6>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Nhận thông tin khuyến mãi và sản phẩm mới nhất qua email
            </p>

            <div className="relative mb-8">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="h-12 rounded-xl bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:bg-gray-100 focus:border-blue-400 pr-14"
                onPressEnter={handleSubscribe}
              />
              <Button
                type="primary"
                onClick={handleSubscribe}
                icon={<SendOutlined />}
                className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-lg shadow-lg"
              />
            </div>

            <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200 space-y-3">
              <p className="text-gray-800 font-bold text-sm">
                {config.name || "Tên công ty"}
              </p>
              <div className="space-y-2.5 text-xs text-gray-500">
                <p className="flex items-start gap-3">
                  <MailOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="break-all">
                    {config.email || "email@example.com"}
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">
                    {config.address || "Địa chỉ công ty"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-300/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold text-gray-800">
                {config.name || "Your Brand"}
              </span>
              . All rights reserved. Made with{" "}
              <HeartOutlined className="text-red-500 mx-1" /> in Vietnam
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link
                href="/dieu-khoan"
                className="hover:text-gray-800 transition-colors"
              >
                Điều khoản
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/chinh-sach-bao-mat"
                className="hover:text-gray-800 transition-colors"
              >
                Bảo mật
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/cookies"
                className="hover:text-gray-800 transition-colors"
              >
                Cookies
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/sitemap"
                className="hover:text-gray-800 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .ant-input::placeholder {
          color: rgba(107, 114, 128, 0.7) !important;
        }

        .ant-input:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
