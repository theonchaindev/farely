import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const flight = await prisma.trackedFlight.findFirst({ where: { id, userId: session.userId } })
  if (!flight) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.trackedFlight.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
