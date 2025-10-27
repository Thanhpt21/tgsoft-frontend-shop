'use client';

import Link from 'next/link';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, TwitterOutlined, GlobalOutlined, LinkOutlined, SendOutlined } from '@ant-design/icons';
import { Input, Button, Space } from 'antd';
import { Config } from '@/types/config.type';
import { useState } from 'react';

interface FooterProps {
  config: Config;
}

const Footer = ({ config }: FooterProps) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log('Subscribed:', email);
    setEmail('');
  };

  const socialLinks = [
    { icon: <FacebookOutlined />, url: config.facebook, color: 'hover:text-blue-600' },
    { icon: <TwitterOutlined />, url: config.x, color: 'hover:text-sky-500' },
    { icon: <InstagramOutlined />, url: config.instagram, color: 'hover:text-pink-600' },
    { icon: <YoutubeOutlined />, url: config.youtube, color: 'hover:text-red-600' },
    { icon: <GlobalOutlined />, url: config.zalo, color: 'hover:text-blue-500' },
    { icon: <LinkOutlined />, url: config.tiktok, color: 'hover:text-gray-900' },
    { icon: <LinkOutlined />, url: config.linkedin, color: 'hover:text-blue-700' },
  ].filter(link => link.url);

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <PhoneOutlined className="text-white text-lg" />
              </div>
              <div>
                <h6 className="font-semibold text-gray-900 text-sm">Gọi mua hàng</h6>
                <p className="text-xs text-gray-500">08:30 - 22:00</p>
              </div>
            </div>
            <a 
              href={`tel:${config.mobile}`}
              className="block text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              {config.mobile || '0963 646 444'}
            </a>
            <p className="text-xs text-gray-500 leading-relaxed">
              Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h6 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Về chúng tôi</h6>
            <ul className="space-y-3">
              {[
                { label: 'Giới thiệu', href: '/gioi-thieu' },
                { label: 'Sản phẩm', href: '/san-pham' },
                { label: 'Tin tức', href: '/tin-tuc' },
                { label: 'Liên hệ', href: '/lien-he' },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-600 transition-all mr-0 group-hover:mr-2"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support & Contact */}
          <div>
            <h6 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h6>
            <ul className="space-y-3 mb-6">
              {[
                { label: 'Hướng dẫn chọn size', href: '/huong-dan-chon-size' },
                { label: 'Khách hàng thân thiết', href: '/chinh-sach-khach-hang-than-thiet' },
                { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-600 transition-all mr-0 group-hover:mr-2"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{config.name || 'Tên công ty'}</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="flex items-start">
                  <MailOutlined className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{config.email || 'email@example.com'}</span>
                </p>
                <p className="flex items-start">
                  <EnvironmentOutlined className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{config.address || 'Địa chỉ công ty'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h6 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Nhận tin mới</h6>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Đăng ký để nhận thông tin khuyến mãi và sản phẩm mới nhất
            </p>
            
            <div className="flex mb-6">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="rounded-r-none focus:!border-blue-500 focus:!shadow-none"
                onPressEnter={handleSubscribe}
              />
              <Button 
                type="primary" 
                onClick={handleSubscribe}
                icon={<SendOutlined />}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-l-none"
              />
            </div>

            {/* Social Media */}
            <div>
              <h6 className="font-bold text-gray-900 mb-3 text-sm">Kết nối với chúng tôi</h6>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 ${link.color} transition-all hover:scale-110 hover:shadow-md`}
                  >
                    <span className="text-lg">{link.icon}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-700">{config.name || 'Tên trang web'}</span>. Đã đăng ký bản quyền.
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="/dieu-khoan" className="hover:text-blue-600 transition-colors">
                Điều khoản
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/chinh-sach-bao-mat" className="hover:text-blue-600 transition-colors">
                Bảo mật
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/cookies" className="hover:text-blue-600 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;