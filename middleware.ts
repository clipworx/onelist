// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth' // Your JWT utility

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  try {
    if (!token || !verifyToken(token)) {
      // Unauthenticated: Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If authenticated, continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|auth).*)',
  ],
}