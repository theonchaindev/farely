import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const res = NextResponse.next()
  if (!req.cookies.get('farely-session')) {
    res.cookies.set('farely-session', crypto.randomUUID(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
