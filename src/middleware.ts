import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth' // using jose-based verifier

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const url = request.nextUrl

  const isAuthPage = url.pathname.startsWith('/auth/login') || url.pathname.startsWith('/auth/register')

  // Token exists and user tries to access login/register → redirect to dashboard
  if (token) {
    const payload = await verifyToken(token)
    if (payload && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!payload && !isAuthPage) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  }

  // No token and user is trying to access a protected page → redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // No token but accessing login/register → allow
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico).*)', // applies to everything except public paths
  ],
}
