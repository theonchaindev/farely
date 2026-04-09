import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only')
const protectedRoutes = ['/dashboard']
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('farely-token')?.value

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuth = authRoutes.some((r) => pathname.startsWith(r))

  let valid = false
  if (token) {
    try {
      await jwtVerify(token, secret)
      valid = true
    } catch {}
  }

  if (isProtected && !valid) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isAuth && valid) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/login', '/register'] }
