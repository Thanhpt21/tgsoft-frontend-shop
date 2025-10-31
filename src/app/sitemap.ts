import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    // Fetch dynamic products
    const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/all/list`, {
      next: { revalidate: 86400 } // Revalidate every 24 hours
    })
    const products = await productsRes.json()

    const productPages: MetadataRoute.Sitemap = products.data?.map((product: any) => ({
      url: `${baseUrl}/san-pham/${product.slug}`,
      lastModified: new Date(product.updatedAt || product.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    // Fetch dynamic categories
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/all/list`, {
      next: { revalidate: 86400 }
    })
    const categories = await categoriesRes.json()

    const categoryPages: MetadataRoute.Sitemap = categories.data?.map((category: any) => ({
      url: `${baseUrl}/san-pham?categoryId=${category.id}`,
      lastModified: new Date(category.updatedAt || category.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

    // Fetch dynamic brands
    const brandsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands/all/list`, {
      next: { revalidate: 86400 }
    })
    const brands = await brandsRes.json()

    const brandPages: MetadataRoute.Sitemap = brands.data?.map((brand: any) => ({
      url: `${baseUrl}/san-pham?brandId=${brand.id}`,
      lastModified: new Date(brand.updatedAt || brand.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

    // Fetch dynamic blogs/news
    const blogsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/all/list`, {
      next: { revalidate: 86400 }
    })
    const blogs = await blogsRes.json()

    const blogPages: MetadataRoute.Sitemap = blogs.data?.map((blog: any) => ({
      url: `${baseUrl}/tin-tuc/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })) || []

    return [...staticPages, ...productPages, ...categoryPages, ...brandPages, ...blogPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}