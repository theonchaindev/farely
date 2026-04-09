import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCheapestFlight } from '@/lib/amadeus'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { flightId } = await req.json()
  const flight = await prisma.trackedFlight.findFirst({ where: { id: flightId, userId: session.userId } })
  if (!flight) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const offer = await getCheapestFlight(
    flight.origin, flight.destination, flight.departDate,
    flight.returnDate || undefined
  )
  if (!offer) return NextResponse.json({ error: 'Could not fetch price' }, { status: 500 })

  const isNewLow = !flight.lowestPrice || offer.price < flight.lowestPrice

  await prisma.trackedFlight.update({
    where: { id: flight.id },
    data: {
      lowestPrice: isNewLow ? offer.price : flight.lowestPrice,
      lastChecked: new Date(),
    },
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

  return NextResponse.json({ offer, isNewLow })
}
