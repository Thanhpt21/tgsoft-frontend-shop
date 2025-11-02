import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/admin')) {
    try {
      const userId = req.cookies.get('userId')?.value
      const tenantIdFromCookie = req.cookies.get('tenantId')?.value
      const tenantIdFromEnv = process.env.NEXT_PUBLIC_TENANT_ID
      const tenantId = tenantIdFromCookie || tenantIdFromEnv

      if (!userId || !tenantId) {
        console.warn('Thiếu userId hoặc tenantId -> redirect /login')
        return NextResponse.redirect(`${req.nextUrl.origin}/login`)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-tenant-roles/user/${userId}/tenant/${tenantId}`
      )

      if (!response.ok) {
        console.warn('API check roles thất bại -> redirect /login')
        return NextResponse.redirect(`${req.nextUrl.origin}/login`)
      }

      const data = await response.json()

      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn('User không có role trong tenant -> redirect /403')
        return NextResponse.redirect(`${req.nextUrl.origin}/403`)
      }

      return NextResponse.next()
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.redirect(`${req.nextUrl.origin}/login`)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
