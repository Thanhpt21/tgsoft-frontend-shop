"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { useBlogBySlug } from "@/hooks/blog/useBlogBySlug";
import { useAllBlogs } from "@/hooks/blog/useAllBlogs";
import { Blog } from "@/types/blog.type";
import { getImageUrl } from "@/utils/getImageUrl";

// Icons as components
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

// Loading component
function BlogLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-8">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content Skeleton */}
          <div className="flex-1">
            {/* Title Skeleton */}
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-6 animate-pulse" />
            
            {/* Meta Info Skeleton */}
            <div className="flex gap-4 mb-8">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Featured Image Skeleton */}
            <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-xl mb-8 animate-pulse" />

            {/* Content Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:w-96">
            <div className="sticky top-8">
              <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component cho Image
const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  fill = false,
  sizes,
  priority = false 
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/images/no-image.png";
      }}
    />
  );
};

// Related Blogs component
function RelatedBlogs({ currentSlug }: { currentSlug: string }) {
  const { data: allBlogs, isLoading } = useAllBlogs();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const relatedBlogs = allBlogs
    ?.filter((b: Blog) => b.slug !== currentSlug && b.isPublished)
    .slice(0, 3) || [];

  if (relatedBlogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Chưa có bài viết liên quan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relatedBlogs.map((blog: Blog) => (
        <Link 
          key={blog.id} 
          href={`/tin-tuc/${blog.slug}`}
          prefetch={false}
          className="group block"
        >
          <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
              <OptimizedImage
                alt={blog.title}
                src={getImageUrl(blog.thumb ?? "") || "/images/no-image.png"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {blog.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <CalendarIcon />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <EyeIcon />
                <span>{blog.numberViews?.toLocaleString() || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Main component
export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogContent slug={slug} />
    </Suspense>
  );
}

// Blog Content component
function BlogContent({ slug }: { slug: string }) {
  const { data: blog, isLoading, isError } = useBlogBySlug({ slug });

  if (isLoading) {
    return <BlogLoading />;
  }

  if (isError || !blog?.isPublished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 mb-6">
            Bài viết này không tồn tại hoặc chưa được công bố.
          </p>
          <Link href="/tin-tuc">
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Quay lại tin tức
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse content
  const content = (() => {
    try {
      if (typeof blog.content === "string") {
        return JSON.parse(blog.content);
      } else if (Array.isArray(blog.content)) {
        return blog.content;
      }
    } catch (error) {
      console.error("Lỗi khi parse nội dung:", error);
    }
    return [];
  })();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/"
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <HomeIcon />
              <span>Trang chủ</span>
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/tin-tuc"
              className="hover:text-blue-600 transition-colors"
            >
              Tin tức
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600 font-medium truncate">
              {blog.title}
            </span>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 lg:max-w-3xl">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-6 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <span className="text-sm">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <EyeIcon />
                  <span className="text-sm">
                    {blog.numberViews?.toLocaleString() || 0} lượt xem
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.thumb && (
              <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
                <OptimizedImage
                  src={getImageUrl(blog.thumb) || "/images/no-image.png"}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Description */}
            {blog.description && (
              <div className="mb-8">
                <div className="relative pl-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                  <p className="text-lg text-gray-700 leading-relaxed italic">
                    {blog.description}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="blog-content">
              {content.length > 0 ? (
                <div className="space-y-8">
                  {content.map((item: any, index: number) => (
                    <section key={index} className="scroll-mt-8">
                      {item.title && (
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {item.title}
                        </h2>
                      )}
                      {item.body && (
                        <div
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.body }}
                        />
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nội dung đang được cập nhật</h3>
                  <p className="text-gray-600">Chúng tôi đang hoàn thiện bài viết này.</p>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar - Related Blogs */}
          <aside className="lg:w-96">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Bài viết liên quan
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
              </div>
              
              <Suspense fallback={
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              }>
                <RelatedBlogs currentSlug={slug} />
              </Suspense>

              {/* Newsletter CTA */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">Nhận tin mới nhất</h3>
                <p className="text-sm text-gray-600 mb-4">Đăng ký để không bỏ lỡ bài viết mới</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .blog-content {
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
        }

        @media (min-width: 768px) {
          .blog-content {
            font-size: 17px;
            line-height: 1.9;
          }
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content h2 {
          font-size: 1.75rem;
          position: relative;
          padding-left: 1rem;
        }

        .blog-content h2::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.25rem;
          bottom: 0.25rem;
          width: 3px;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        @media (min-width: 768px) {
          .blog-content h2 {
            font-size: 2rem;
          }
        }

        .blog-content p {
          margin-bottom: 1.5rem;
          text-align: justify;
        }

        .blog-content img {
          border-radius: 0.75rem;
          margin: 1.5rem auto;
          max-width: 100%;
          height: auto;
          display: block;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        @media (min-width: 768px) {
          .blog-content img {
            margin: 2rem auto;
            max-width: 90%;
          }
        }

        .blog-content a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
          padding-bottom: 1px;
        }

        .blog-content a:hover {
          color: #1d4ed8;
          border-bottom-color: #2563eb;
        }

        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          position: relative;
        }

        .blog-content ul li::before {
          content: '•';
          color: #3b82f6;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }

        .blog-content ol {
          counter-reset: list-counter;
        }

        .blog-content ol li {
          counter-increment: list-counter;
        }

        .blog-content ol li::before {
          content: counter(list-counter) '.';
          color: #3b82f6;
          font-weight: 600;
          position: absolute;
          left: -1.5em;
        }

        .blog-content blockquote {
          margin: 2rem 0;
          padding-left: 1.5rem;
          border-left: 3px solid #e5e7eb;
          font-style: italic;
          color: #6b7280;
          background: transparent;
        }

        .blog-content code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          color: #dc2626;
          font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace;
        }

        .blog-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.875em;
          line-height: 1.5;
        }

        .blog-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 0.875em;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }

        .blog-content th {
          background: #f9fafb;
          font-weight: 600;
          color: #111827;
        }

        .blog-content tr:nth-child(even) {
          background: #f9fafb;
        }

        .blog-content strong {
          font-weight: 600;
          color: #111827;
        }

        .blog-content em {
          font-style: italic;
          color: #4b5563;
        }

        /* Typography improvements */
        .blog-content {
          font-feature-settings: "kern", "liga", "clig", "calt";
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Selection color */
        .blog-content ::selection {
          background-color: rgba(59, 130, 246, 0.2);
        }

        /* Smooth scrolling for anchor links */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}