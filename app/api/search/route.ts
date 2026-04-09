import { NextRequest, NextResponse } from 'next/server'
import { getCheapestDates, hasAmadeusKeys } from '@/lib/amadeus'

// Amadeus city codes for multi-airport cities
const CITY_CODE: Record<string, string> = {
  London: 'LON',
  Paris: 'PAR',
  'New York': 'NYC',
  Milan: 'MIL',
  Tokyo: 'TYO',
  Stockholm: 'STO',
  Oslo: 'OSL',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const originCity = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''

  if (!originCity || !destination) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  if (!hasAmadeusKeys()) {
    return NextResponse.json({ configured: false, fares: [] })
  }

  const originCode = CITY_CODE[originCity] || originCity
  const fares = await getCheapestDates(originCode, destination)
  return NextResponse.json({ configured: true, fares })
}
