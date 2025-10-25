'use client';

import Link from 'next/link';
// Imports icons từ Ant Design
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, TwitterOutlined, GlobalOutlined, LinkOutlined } from '@ant-design/icons';
import { Input, Button, Space, Image } from 'antd';
import { Config } from '@/types/config.type';


// Định nghĩa interface cho props của Footer
interface FooterProps {
  config: Config;
}

const Footer = ({ config }: FooterProps) => {
  return (
    <footer className="bg-gray-100 border-t py-12 text-sm text-gray-500 ">
      <div className='container mx-auto lg:px-12 md:px-8 p-4'>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Gọi mua hàng */}
        <div>
          <div className="flex items-center mb-2">
            <PhoneOutlined className="text-xl mr-2 text-blue-500" />
            <h6 className="font-semibold">Gọi mua hàng (08:30 - 22:00)</h6>
          </div>
          <p className="text-blue-500 text-lg font-semibold">
            {config.mobile || '0963 646 444'}
          </p>
        </div>

        {/* Cột 2: Về chúng tôi */}
        <div>
          <h6 className="font-semibold mb-2">Về chúng tôi</h6>
          <ul className="list-none space-y-1">
            <li><Link href="/gioi-thieu" className="hover:underline">Giới thiệu</Link></li>
            <li><Link href="/san-pham" className="hover:underline">Sản phẩm</Link></li>
            <li><Link href="/tin-tuc" className="hover:underline">Tin tức</Link></li>
            <li><Link href="/lien-he" className="hover:underline">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng và thông tin liên hệ */}
        <div>
          <h6 className="font-semibold mb-2">Hỗ trợ khách hàng</h6>
          <ul className="list-none space-y-1">
            <li><Link href="/huong-dan-chon-size" className="hover:underline">Hướng dẫn chọn size</Link></li>
            <li><Link href="/chinh-sach-khach-hang-than-thiet" className="hover:underline">Chính sách khách hàng thân thiết</Link></li>
            <li><Link href="/cau-hoi-thuong-gap" className="hover:underline">Câu hỏi thường gặp</Link></li>
          </ul>
          <div className="mt-4">
            <Link href="/" className="inline-block mb-1">
            {/* <Image
              src={}
              alt="Logo Bộ Công Thương"
              width={120}
              height={40}
              preview={false}
            /> */}
          </Link>
            <p className="text-xs">{config.name || 'Tên công ty'}</p>
            <p className="text-xs flex items-center">
              <MailOutlined className="text-base mr-1" />
              {config.email || 'email@example.com'}
            </p>
            <p className="text-xs flex items-center">
              <EnvironmentOutlined className="text-base mr-1" />
              {config.address || 'Địa chỉ công ty'}
            </p>
          </div>
        </div>

        {/* Cột 4: Đăng ký nhận khuyến mãi và Mạng xã hội */}
        <div>
          <h6 className="font-semibold mb-2">Đăng ký nhận khuyến mãi</h6>
          <Space className="w-full mb-4">
            <Input
              type="email"
              placeholder="Email của bạn"
              className="flex-grow focus:!border-blue-500 focus:!shadow-none"
            />
            <Button type="primary" className="bg-blue-500 hover:!bg-blue-600 focus:!bg-blue-600">
              Gửi
            </Button>
          </Space >
          <div className="flex space-x-4">
            {config.facebook && (
              <Link href={config.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <FacebookOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.x && (
              <Link href={config.x} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <TwitterOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.instagram && (
              <Link href={config.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <InstagramOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.youtube && (
              <Link href={config.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <YoutubeOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.zalo && (
              <Link href={config.zalo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <GlobalOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.tiktok && (
              <Link href={config.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <LinkOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.linkedin && (
              <Link href={config.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <LinkOutlined className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
        </div>
        <div className="px-4 md:px-6 mt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} {config.name || 'Tên trang web'}. Đã đăng ký bản quyền.
        </div>
        </div>
    </footer>
  );
};

export default Footer;