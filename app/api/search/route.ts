import { NextRequest, NextResponse } from 'next/server'

const LONDON_AIRPORTS: Record<string, string> = {
  STN: 'Stansted',
  LGW: 'Gatwick',
  LHR: 'Heathrow',
  LTN: 'Luton',
  LCY: 'City',
}

async function fetchRyanair(origin: string, destination: string, dateFrom: string, dateTo: string) {
  const url = `https://services-api.ryanair.com/farfnd/v4/oneWayFares?departureAirportIataCode=${origin}&arrivalAirportIataCode=${destination}&outboundDepartureDateFrom=${dateFrom}&outboundDepartureDateTo=${dateTo}&currency=GBP&market=en-gb`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.outbound?.fares || [])
      .filter((f: any) => !f.sold && !f.unavailable && f.price?.value > 0)
      .map((f: any) => ({
        date: f.day,
        price: parseFloat(f.price.value),
        currency: 'GBP',
        origin,
        originName: LONDON_AIRPORTS[origin] || origin,
        destination,
        airline: 'Ryanair',
        bookingUrl: `https://www.ryanair.com/gb/en/trip/flights/select?adults=1&dateOut=${f.day}&originIata=${origin}&destinationIata=${destination}&isReturn=false`,
      }))
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const originsParam = searchParams.get('origins') || ''
  const destination = searchParams.get('destination') || ''

  if (!originsParam || !destination) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const origins = originsParam.split(',').filter(Boolean)
  const today = new Date()
  const dateFrom = today.toISOString().split('T')[0]
  const dateTo = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const all = (await Promise.all(origins.map((o) => fetchRyanair(o, destination, dateFrom, dateTo)))).flat()
  const sorted = all.sort((a, b) => a.price - b.price)

  return NextResponse.json(sorted)
}
