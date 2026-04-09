import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed } })
  const token = await signToken({ userId: user.id, email: user.email })

  const res = NextResponse.json({ success: true })
  res.cookies.set('farely-token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
  return res
}
