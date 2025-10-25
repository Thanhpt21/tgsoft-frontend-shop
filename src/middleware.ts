import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Chỉ kiểm tra khi truy cập vào /admin
  if (pathname.startsWith('/admin')) {
    try {
      const userId = req.cookies.get('userId')?.value
      const tenantIdFromCookie = req.cookies.get('tenantId')?.value
      const tenantIdFromEnv = process.env.NEXT_PUBLIC_TENANT_ID
      const tenantId = tenantIdFromCookie || tenantIdFromEnv


      if (!userId || !tenantId) {
        console.warn('Thiếu userId hoặc tenantId -> redirect /login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Gọi API để kiểm tra roles (không cần token)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-tenant-roles/user/${userId}/tenant/${tenantId}`
      )

      if (!response.ok) {
        console.warn('API check roles thất bại -> redirect /login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      const data = await response.json()

      // Kiểm tra roles rỗng
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn('User không có role trong tenant -> redirect /403')
        return NextResponse.redirect(new URL('/403', req.url))
      }
      return NextResponse.next()
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Các route khác không cần kiểm tra
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
