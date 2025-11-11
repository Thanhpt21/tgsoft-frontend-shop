"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  EyeOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { useBlogBySlug } from "@/hooks/blog/useBlogBySlug";
import { useAllBlogs } from "@/hooks/blog/useAllBlogs";
import { Blog } from "@/types/blog.type";
import { getImageUrl } from "@/utils/getImageUrl";

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
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">
            Đang tải bài viết...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !displayedBlog) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 mb-6">
            Bài viết này không tồn tại hoặc chưa được công bố.
          </p>
          <Link href="/tin-tuc">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
              Quay lại tin tức
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse content
  let content = [];
  try {
    if (typeof displayedBlog.content === "string") {
      content = JSON.parse(displayedBlog.content);
    } else if (Array.isArray(displayedBlog.content)) {
      content = displayedBlog.content;
    }
  } catch (error) {
    console.error("Lỗi khi parse nội dung:", error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <HomeOutlined />
            <span>Trang chủ</span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-blue-600 font-medium">Tin tức</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 lg:w-2/3">
            {/* Featured Image - Outside card */}
            {displayedBlog.thumb && (
              <div className="relative w-full mb-6 flex items-center justify-center">
                <Image
                  src={
                    getImageUrl(displayedBlog.thumb) || "/images/no-image.png"
                  }
                  alt={displayedBlog.title}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                  priority
                />
              </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {displayedBlog.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined className="text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium">
                      {new Date(displayedBlog.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <EyeOutlined className="text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium">
                      {displayedBlog.numberViews?.toLocaleString()} lượt xem
                    </span>
                  </div>
                </div>

                {/* Description */}
                {displayedBlog.description && (
                  <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-600">
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed italic">
                      {displayedBlog.description}
                    </p>
                  </div>
                )}

                {/* Content */}
                <div className="blog-content prose prose-lg max-w-none">
                  {content.length > 0 ? (
                    content.map((item: any, index: number) => (
                      <div key={index} className="mb-8 sm:mb-10">
                        {item.title && (
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 border-l-4 border-blue-600 pl-3 sm:pl-4">
                            {item.title}
                          </h2>
                        )}
                        {item.body && (
                          <div
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.body }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500 text-lg">
                        Nội dung bài viết đang được cập nhật.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Related Blogs */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
                  Bài viết liên quan
                </h2>

                {relatedBlogs && relatedBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {relatedBlogs.map((rb: Blog) => (
                      <Link key={rb.id} href={`/tin-tuc/${rb.slug}`}>
                        <div className="group flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200">
                          <div className="relative w-20 sm:w-24 h-16 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            <Image
                              alt={rb.title}
                              src={
                                getImageUrl(rb.thumb ?? "") ||
                                "/images/no-image.png"
                              }
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                              {rb.title}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <EyeOutlined />
                                <span>{rb.numberViews}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarOutlined />
                                <span>
                                  {new Date(rb.createdAt).toLocaleDateString(
                                    "vi-VN",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Không có bài viết liên quan</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .blog-content {
          font-size: 15px;
          line-height: 1.8;
        }

        @media (min-width: 640px) {
          .blog-content {
            font-size: 16px;
          }
        }

        @media (min-width: 768px) {
          .blog-content {
            font-size: 17px;
          }
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }

        @media (min-width: 640px) {
          .blog-content h1,
          .blog-content h2,
          .blog-content h3,
          .blog-content h4 {
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
        }

        .blog-content p {
          margin-bottom: 1.25rem;
        }

        @media (min-width: 640px) {
          .blog-content p {
            margin-bottom: 1.5rem;
          }
        }

        .blog-content img {
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 640px) {
          .blog-content img {
            border-radius: 1rem;
            margin: 2rem 0;
          }
        }

        .blog-content a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 2px solid #93c5fd;
          transition: all 0.2s;
        }

        .blog-content a:hover {
          color: #1d4ed8;
          border-bottom-color: #2563eb;
        }

        .blog-content ul,
        .blog-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }

        @media (min-width: 640px) {
          .blog-content ul,
          .blog-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        @media (min-width: 640px) {
          .blog-content li {
            margin-bottom: 0.75rem;
          }
        }

        .blog-content blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        @media (min-width: 640px) {
          .blog-content blockquote {
            padding-left: 1.5rem;
            margin: 2rem 0;
            padding: 1.5rem;
          }
        }

        .blog-content code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          color: #be123c;
        }

        @media (min-width: 640px) {
          .blog-content code {
            padding: 0.25rem 0.5rem;
          }
        }

        .blog-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        @media (min-width: 640px) {
          .blog-content pre {
            padding: 1.5rem;
            border-radius: 0.75rem;
            margin: 2rem 0;
          }
        }

        .blog-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        @media (min-width: 640px) {
          .blog-content table {
            margin: 2rem 0;
          }
        }

        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }

        @media (min-width: 640px) {
          .blog-content th,
          .blog-content td {
            padding: 0.75rem;
          }
        }

        .blog-content th {
          background: #f3f4f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
