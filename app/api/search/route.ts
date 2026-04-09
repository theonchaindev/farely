import { NextRequest, NextResponse } from 'next/server'
import { searchFlightOffers, hasAmadeusKeys } from '@/lib/amadeus'

// Amadeus city codes for multi-airport cities
const CITY_CODES: Record<string, string> = {
  London: 'LON', Paris: 'PAR', 'New York': 'NYC', Milan: 'MIL',
  Tokyo: 'TYO', Stockholm: 'STO', Oslo: 'OSL', Manchester: 'MAN',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const originLabel = searchParams.get('origin') || ''
  const originSkyId = searchParams.get('originSkyId') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''

  if (!date || !destination) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  if (!hasAmadeusKeys()) {
    return NextResponse.json({ configured: false, flights: [] })
  }

  // Resolve origin: use city code if it's a multi-airport city, else use skyId/IATA
  const originCode = CITY_CODES[originLabel] || originSkyId || originLabel

  const offers = await searchFlightOffers(originCode, destination, date)

  const flights = offers.map((o: any, i: number) => ({
    id: `${i}`,
    price: o.price,
    priceFormatted: `£${Math.round(o.price)}`,
    airline: o.airlineName,
    airlineLogo: null,
    airlineCode: o.airline,
    departure: o.departure,
    arrival: o.arrival,
    durationMins: 0,
    stops: o.stops,
    originCode: originCode,
    destCode: destination,
    deepLink: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(originLabel||originCode)}+to+${encodeURIComponent(destination)}+on+${date}`,
  }))

  return NextResponse.json({ configured: true, flights })
}
