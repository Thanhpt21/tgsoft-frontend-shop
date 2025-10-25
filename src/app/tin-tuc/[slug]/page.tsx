'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Spin, Empty, Divider, Typography, Breadcrumb, Image } from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

import { useBlogBySlug } from '@/hooks/blog/useBlogBySlug';
import { useAllBlogs } from '@/hooks/blog/useAllBlogs';
import { Blog } from '@/types/blog.type';
import { getImageUrl } from '@/utils/getImageUrl';

const { Title, Paragraph } = Typography;

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: blog, isLoading, isError } = useBlogBySlug({ slug });
  const { data: allBlogs, isLoading: isLoadingAllBlogs } = useAllBlogs();

  const displayedBlog = blog?.isPublished ? blog : null;

  const relatedBlogs = allBlogs
    ?.filter((b: Blog) => b.slug !== slug && b.isPublished)
    .slice(0, 3);

  if (isLoading || isLoadingAllBlogs) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải bài viết..." />
      </div>
    );
  }

  if (isError || !displayedBlog) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-xl text-gray-600">
              Không tìm thấy bài viết này hoặc bài viết chưa được công bố.
            </span>
          }
        />
      </div>
    );
  }

  // Parse content - FIX: Kiểm tra kỹ hơn
  let content = [];
  try {
    if (typeof displayedBlog.content === 'string') {
      // Parse string JSON thành array
      content = JSON.parse(displayedBlog.content);
    } else if (Array.isArray(displayedBlog.content)) {
      content = displayedBlog.content;
    }
  } catch (error) {
    console.error("Lỗi khi parse nội dung:", error);
    console.error("Content gốc:", displayedBlog.content); // Debug log
  }

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/tin-tuc">Tin tức</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{displayedBlog.title}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 lg:w-3/4">
          <h1 className="text-4xl md:text-3xl font-extrabold text-center lg:text-left mb-6 leading-tight text-gray-900">
            {displayedBlog.title}
          </h1>

          <div className="flex flex-wrap justify-center lg:justify-start items-center text-gray-600 text-sm mb-8 gap-4">
            <div className="flex items-center gap-2">
              <Image
                src={getImageUrl(displayedBlog.createdBy?.avatar ?? '') || 'https://via.placeholder.com/30'}
                alt={displayedBlog.createdBy?.name || 'Tác giả'}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                preview={false}
              />
              <span>bởi {displayedBlog.createdBy?.name || 'Ẩn danh'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              <span>Ngày đăng: {new Date(displayedBlog.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOutlined />
              <span>Lượt xem: {displayedBlog.numberViews}</span>
            </div>
          </div>

          {displayedBlog.description && (
            <Paragraph className="text-lg text-gray-700 leading-relaxed mb-8">
              {displayedBlog.description}
            </Paragraph>
          )}

          <Divider />

          {/* Nội dung bài viết - FIX: Thêm styling cho HTML content */}
          <div className="blog-content">
            {content.length > 0 ? (
              content.map((item: any, index: number) => (
                <div key={index} className="mb-8">
                  {item.title && (
                    <Title level={5} className="text-2xl font-bold mb-4 text-gray-800">
                      {item.title}
                    </Title>
                  )}
                  {item.body && (
                    <div
                      className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.body }}
                      style={{
                        lineHeight: '1.8',
                        fontSize: '16px'
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Nội dung bài viết đang được cập nhật.</p>
                {/* Debug info - XÓA SAU KHI FIX XONG */}
                <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify({ 
                    contentType: typeof displayedBlog.content,
                    contentLength: displayedBlog.content?.length,
                    rawContent: displayedBlog.content 
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Bài viết liên quan */}
        <div className="lg:w-1/4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Bài viết liên quan</h2>
          {relatedBlogs && relatedBlogs.length > 0 ? (
            <div className="space-y-6">
              {relatedBlogs.map((rb: Blog) => (
                <Link key={rb.id} href={`/tin-tuc/${rb.slug}`} passHref>
                  <div className="flex items-start bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
                    <Image
                      alt={rb.title}
                      src={getImageUrl(rb.thumb ?? '') || 'https://via.placeholder.com/120x80/cccccc/ffffff?text=No+Image'}
                      className="w-24 h-20 object-cover rounded-md flex-shrink-0 mr-4"
                      preview={false}
                    />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                        {rb.title}
                      </h3>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1">
                          <UserOutlined />
                          <span>{rb.createdBy?.name || 'Ẩn danh'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <EyeOutlined />
                          <span>{rb.numberViews}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarOutlined />
                          <span>{new Date(rb.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có bài viết liên quan nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}