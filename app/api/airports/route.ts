import { NextRequest, NextResponse } from 'next/server'
import { searchAirports } from '@/lib/airports'

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json([])
  const results = searchAirports(q)
  return NextResponse.json(
    results.map(a => ({
      skyId: a.iata,
      entityId: a.iata,
      label: `${a.city} (${a.iata})`,
      sublabel: a.country,
      type: 'AIRPORT',
      iata: a.iata,
      city: a.city,
    }))
  )
}
