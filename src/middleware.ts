import { NextRequest, NextResponse } from 'next/server'

function getPublicUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL!
  }
  return 'http://localhost:3000'
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const userId = req.cookies.get('userId')?.value
  const tenantId = req.cookies.get('tenantId')?.value || process.env.NEXT_PUBLIC_TENANT_ID

  // 🔹 Nếu chưa đăng nhập → chuyển về /login
  if (!userId || !tenantId) {
    const loginUrl = new URL('/login', getPublicUrl())
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user-tenant-roles/user/${userId}/tenant/${tenantId}`,
      {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      }
    )

    clearTimeout(timeout)

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()

    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.redirect(new URL('/403', getPublicUrl()))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ Middleware error:', error)
    const loginUrl = new URL('/login', getPublicUrl())
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
