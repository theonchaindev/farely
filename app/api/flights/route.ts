import { NextRequest, NextResponse } from 'next/server'
import { getSessionId } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getCheapestFlight } from '@/lib/amadeus'
import { getAirport } from '@/lib/airports'

export async function GET() {
  const sessionId = await getSessionId()
  if (!sessionId) return NextResponse.json([])

  const flights = await prisma.trackedFlight.findMany({
    where: { sessionId },
    include: { priceHistory: { orderBy: { checkedAt: 'desc' }, take: 10 } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(flights)
}

export async function POST(req: NextRequest) {
  const sessionId = await getSessionId()
  if (!sessionId) return NextResponse.json({ error: 'No session' }, { status: 400 })

  const { origin, destination, departDate, returnDate, isRoundTrip } = await req.json()
  if (!origin || !destination || !departDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const originAirport = getAirport(origin)
  const destAirport = getAirport(destination)

  const flight = await prisma.trackedFlight.create({
    data: {
      sessionId,
      origin,
      destination,
      originCity: originAirport?.city || origin,
      destCity: destAirport?.city || destination,
      departDate,
      returnDate: isRoundTrip ? returnDate : null,
      isRoundTrip: !!isRoundTrip,
    },
  })

  // Fetch initial price
  const offer = await getCheapestFlight(origin, destination, departDate, returnDate)
  if (offer) {
    await prisma.trackedFlight.update({
      where: { id: flight.id },
      data: { lowestPrice: offer.price, currency: offer.currency, lastChecked: new Date() },
    })
    await prisma.pricePoint.create({
      data: {
        trackedFlightId: flight.id,
        price: offer.price,
        currency: offer.currency,
        airline: offer.airline,
        deepLink: offer.deepLink,
      },
    })
  }

  return NextResponse.json(flight)
}
