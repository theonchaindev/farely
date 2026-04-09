import { NextRequest, NextResponse } from 'next/server'

export function hasApiKey() {
  return !!process.env.RAPIDAPI_KEY
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const originSkyId = searchParams.get('originSkyId') || ''
  const originEntityId = searchParams.get('originEntityId') || ''
  const destinationSkyId = searchParams.get('destinationSkyId') || ''
  const destinationEntityId = searchParams.get('destinationEntityId') || ''
  const date = searchParams.get('date') || ''

  if (!originSkyId || !destinationSkyId || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const key = process.env.RAPIDAPI_KEY
  if (!key) return NextResponse.json({ configured: false, flights: [] })

  try {
    const params = new URLSearchParams({
      originSkyId,
      destinationSkyId,
      originEntityId,
      destinationEntityId,
      date,
      cabinClass: 'economy',
      adults: '1',
      sortBy: 'price',
      currency: 'GBP',
      market: 'en-GB',
      countryCode: 'GB',
    })

    const res = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?${params}`,
      {
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 1800 },
      }
    )

    if (!res.ok) return NextResponse.json({ configured: true, flights: [], error: `API error ${res.status}` })

    const data = await res.json()
    const itineraries = data?.data?.itineraries || []

    const flights = itineraries.map((it: any) => {
      const leg = it.legs?.[0]
      const carrier = leg?.carriers?.marketing?.[0]
      return {
        id: it.id,
        price: it.price?.raw ?? 0,
        priceFormatted: it.price?.formatted ?? '—',
        airline: carrier?.name ?? 'Unknown',
        airlineLogo: carrier?.logoUrl ?? null,
        airlineCode: carrier?.alternateId ?? '??',
        departure: leg?.departure ?? '',
        arrival: leg?.arrival ?? '',
        durationMins: leg?.durationInMinutes ?? 0,
        stops: leg?.stopCount ?? 0,
        originCode: leg?.origin?.displayCode ?? originSkyId,
        destCode: leg?.destination?.displayCode ?? destinationSkyId,
        deepLink: it.deeplink ?? '',
      }
    })

    return NextResponse.json({ configured: true, flights })
  } catch (e) {
    return NextResponse.json({ configured: true, flights: [], error: String(e) })
  }
}
