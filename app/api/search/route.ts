import { NextRequest, NextResponse } from 'next/server'

// Multi-airport cities → list of Ryanair IATA codes to try
const CITY_TO_AIRPORTS: Record<string, string[]> = {
  'LOND': ['STN', 'LGW', 'LTN', 'LHR', 'LCY', 'SEN'],
  'London (Any)': ['STN', 'LGW', 'LTN', 'LHR', 'LCY', 'SEN'],
  'PAR': ['CDG', 'ORY', 'BVA'],
  'Paris (Any)': ['CDG', 'ORY', 'BVA'],
  'MAN': ['MAN'],
  'Manchester (MAN)': ['MAN'],
  'BHX': ['BHX'],
  'EDI': ['EDI'],
  'GLA': ['GLA'],
  'DUB': ['DUB'],
}

async function fetchRyanairFares(origin: string, destination: string, date: string) {
  const month = date.substring(0, 7) + '-01'
  const url = `https://services-api.ryanair.com/farfnd/3/oneWayFares/${origin}/${destination}/cheapestPerDay?outboundMonthOfDate=${month}&currency=GBP`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer': 'https://www.ryanair.com/',
        'Origin': 'https://www.ryanair.com',
      },
    })

    if (!res.ok) return []

    const data = await res.json()
    const fares: any[] = data?.outbound?.fares || []

    return fares
      .filter(f => f.day === date && !f.soldOut && !f.unavailable && f.price?.value)
      .map(f => ({
        airline: 'FR',
        airlineName: 'Ryanair',
        originCode: origin,
        price: f.price.value,
        departure: f.departureDate,
        arrival: f.arrivalDate,
        stops: 0,
      }))
  } catch {
    return []
  }
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

  // Determine airports to search — city → multiple airports, or single IATA
  const airports =
    CITY_TO_AIRPORTS[originSkyId] ||
    CITY_TO_AIRPORTS[originLabel] ||
    [originSkyId || originLabel].filter(Boolean)

  // Fetch Ryanair fares from all candidate origin airports in parallel
  const settled = await Promise.allSettled(
    airports.map(ap => fetchRyanairFares(ap, destination, date))
  )

  const allFlights: any[] = []
  settled.forEach(r => {
    if (r.status === 'fulfilled') allFlights.push(...r.value)
  })

  allFlights.sort((a, b) => a.price - b.price)

  const flights = allFlights.map((o, i) => {
    const durationMins =
      o.departure && o.arrival
        ? Math.round((new Date(o.arrival).getTime() - new Date(o.departure).getTime()) / 60000)
        : 0

    return {
      id: `${i}`,
      price: o.price,
      priceFormatted: `£${o.price.toFixed(2)}`,
      airline: o.airlineName,
      airlineLogo: `https://www.ryanair.com/assets/img/logos/ryanair-logo.png`,
      airlineCode: o.airline,
      departure: o.departure,
      arrival: o.arrival,
      durationMins,
      stops: o.stops,
      originCode: o.originCode,
      destCode: destination,
      deepLink: `https://www.ryanair.com/gb/en/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=${date}&originIata=${o.originCode}&destinationIata=${destination}&isConnectedFlight=false&isReturn=false&discount=0`,
    }
  })

  return NextResponse.json({ configured: true, flights })
}
