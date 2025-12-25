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
  HeartOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Config } from "@/types/config.type";

interface FooterProps {
  config: Config;
}

const Footer = ({ config }: FooterProps) => {
  const socialLinks = [
    {
      icon: <FacebookOutlined />,
      url: config.facebook,
      color: "bg-blue-600 hover:bg-blue-500",
      label: "Facebook",
    },
    {
      icon: <TwitterOutlined />,
      url: config.x,
      color: "bg-sky-500 hover:bg-sky-400",
      label: "Twitter",
    },
    {
      icon: <InstagramOutlined />,
      url: config.instagram,
      color: "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
      label: "Instagram",
    },
    {
      icon: <YoutubeOutlined />,
      url: config.youtube,
      color: "bg-red-600 hover:bg-red-500",
      label: "Youtube",
    },
  ].filter((link) => link.url);

  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300">
      {/* Subtle Background Orbs - Dark version */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Company Info & Contact */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                {config.name || "Your Brand"}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng
              </p>
            </div>

            <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:bg-gray-800 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <PhoneOutlined className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hotline hỗ trợ</p>
                  <p className="text-gray-500 text-xs">
                    08:30 - 22:00 hàng ngày
                  </p>
                </div>
              </div>
              <a
                href={`tel:${config.mobile}`}
                className="block text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-green-300 transition-all"
              >
                {config.mobile || "0963 646 444"}
              </a>
            </div>

            <div>
              <h6 className="text-gray-300 font-bold mb-5 text-sm flex items-center gap-3">
                <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
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
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h6 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-3">
              <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
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
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
            <h6 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-3">
              <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
              Chính sách & Hỗ trợ
            </h6>
            <ul className="space-y-3">
              {[
                { label: "Hướng dẫn chọn size", href: "/huong-dan-chon-size" },
                { label: "Khách hàng thân thiết", href: "/chinh-sach-khach-hang-than-thiet" },
                { label: "Câu hỏi thường gặp", href: "/cau-hoi-thuong-gap" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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

          {/* Column 4: Company Info */}
          <div>
            <h6 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-3">
              <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
              Thông tin liên hệ
            </h6>

            <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <p className="text-white font-bold text-sm mb-4">
                {config.name || "Tên công ty"}
              </p>
              <div className="space-y-4 text-sm text-gray-400">
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
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <p className="text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold text-white">
                {config.name || "Your Brand"}
              </span>
              . All rights reserved. Made with{" "}
              <HeartOutlined className="text-red-500 mx-1" /> in Vietnam
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-500">
              <Link
                href="/dieu-khoan"
                className="hover:text-white transition-colors"
              >
                Điều khoản
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/chinh-sach-bao-mat"
                className="hover:text-white transition-colors"
              >
                Bảo mật
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;