import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/tai-khoan/',
          '/gio-hang/',
          '/dat-hang/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/tai-khoan/',
          '/gio-hang/',
          '/dat-hang/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/tai-khoan/',
          '/gio-hang/',
          '/dat-hang/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}