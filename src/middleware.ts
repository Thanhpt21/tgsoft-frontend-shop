import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Chỉ kiểm tra khi truy cập vào /admin
  if (pathname.startsWith('/admin')) {
    try {
      // Lấy userId và tenantId từ cookies
      const userId = req.cookies.get('userId')?.value
      const tenantIdFromCookie = req.cookies.get('tenantId')?.value
      const tenantIdFromEnv = process.env.NEXT_PUBLIC_TENANT_ID

      // Nếu không có userId và tenantId (cookie hoặc env), redirect tới /login
      const tenantId = tenantIdFromCookie || tenantIdFromEnv
      if (!userId || !tenantId) {
        console.warn('Thiếu userId hoặc tenantId -> redirect /login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Gọi API để kiểm tra roles (không cần token)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-tenant-roles/user/${userId}/tenant/${tenantId}`
      )
      console.log('API URL:', response);

      if (!response.ok) {
        console.warn('API check roles thất bại -> redirect /login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      const data = await response.json()

      // Kiểm tra nếu data trả về hợp lệ và có chứa roles
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn('User không có role trong tenant -> redirect /403')
        return NextResponse.redirect(new URL('/403', req.url))
      }

      // Nếu có role hợp lệ, cho phép tiếp tục
      return NextResponse.next()
    } catch (error) {
      // Log lỗi nếu có và redirect về /login
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Các route khác không cần kiểm tra
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'], // Chỉ áp dụng middleware cho các route /admin
}
