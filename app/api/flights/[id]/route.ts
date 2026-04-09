import { NextRequest, NextResponse } from 'next/server'
import { getSessionId } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionId = await getSessionId()
  if (!sessionId) return NextResponse.json({ error: 'No session' }, { status: 400 })

  const { id } = await params
  const flight = await prisma.trackedFlight.findFirst({ where: { id, sessionId } })
  if (!flight) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.trackedFlight.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
