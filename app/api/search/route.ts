import { NextRequest, NextResponse } from 'next/server'

const CITY_AIRPORTS: Record<string, string[]> = {
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
  'BRS': ['BRS'],
}

function resolveAirports(skyId: string, label: string): string[] {
  return CITY_AIRPORTS[skyId] || CITY_AIRPORTS[label] || [skyId].filter(Boolean)
}

const LOGO = (code: string) => `https://images.kiwi.com/airlines/64/${code}.png`

// ── Ryanair ────────────────────────────────────────────────────────────────
async function fetchRyanair(origin: string, dest: string, date: string) {
  const month = date.substring(0, 7) + '-01'
  try {
    const res = await fetch(
      `https://services-api.ryanair.com/farfnd/3/oneWayFares/${origin}/${dest}/cheapestPerDay?outboundMonthOfDate=${month}&currency=GBP`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-GB,en;q=0.9',
          'Referer': 'https://www.ryanair.com/',
          'Origin': 'https://www.ryanair.com',
        },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data?.outbound?.fares || [])
      .filter((f: any) => f.day === date && !f.soldOut && !f.unavailable && f.price?.value)
      .map((f: any) => ({
        airline: 'FR', airlineName: 'Ryanair', logo: LOGO('FR'),
        origin, price: f.price.value, dep: f.departureDate, arr: f.arrivalDate, stops: 0,
      }))
  } catch { return [] }
}

// ── easyJet ────────────────────────────────────────────────────────────────
async function fetchEasyJet(origin: string, dest: string, date: string) {
  const ym = date.substring(0, 7) // e.g. 2026-06
  try {
    const res = await fetch(
      `https://www.easyjet.com/api/routepricing/v2/getpricegrid?origin=${origin}&destination=${dest}&currency=GBP&outboundDate=${ym}&adult=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.easyjet.com/',
        },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    const grid: any[] = data?.OutboundPriceGrid || data?.outboundPriceGrid || []
    return grid
      .filter((d: any) => (d.DepartureDate || d.departureDate || '').startsWith(date) && (d.Price?.TotalFare || d.price?.totalFare))
      .map((d: any) => ({
        airline: 'U2', airlineName: 'easyJet', logo: LOGO('U2'),
        origin, price: d.Price?.TotalFare ?? d.price?.totalFare,
        dep: d.DepartureDate ?? d.departureDate, arr: d.ArrivalDate ?? d.arrivalDate, stops: 0,
      }))
  } catch { return [] }
}

// ── Wizz Air ───────────────────────────────────────────────────────────────
async function fetchWizzAir(origin: string, dest: string, date: string) {
  try {
    const res = await fetch('https://be.wizzair.com/24.2.0/Api/search/search', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://wizzair.com/',
        'Origin': 'https://wizzair.com',
      },
      body: JSON.stringify({
        flightList: [{ departureStation: origin, arrivalStation: dest, date }],
        adultCount: 1, childCount: 0, infantCount: 0, wdc: true,
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.outboundFlights || [])
      .filter((f: any) => (f.price?.amount ?? 0) > 0)
      .map((f: any) => ({
        airline: 'W6', airlineName: 'Wizz Air', logo: LOGO('W6'),
        origin, price: f.price.amount, dep: f.departureDate, arr: f.arrivalDate, stops: 0,
      }))
  } catch { return [] }
}

// ── deep links ─────────────────────────────────────────────────────────────
function buildDeepLink(airline: string, origin: string, dest: string, date: string, originLabel: string) {
  switch (airline) {
    case 'FR':
      return `https://www.ryanair.com/gb/en/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=${date}&originIata=${origin}&destinationIata=${dest}&isConnectedFlight=false&isReturn=false&discount=0`
    case 'U2':
      return `https://www.easyjet.com/en/routemap?origin=${origin}&destination=${dest}&outboundDate=${date}&adult=1`
    case 'W6':
      return `https://wizzair.com/#/booking/select-flight/${origin}/${dest}/${date}/null/1/0/0/null`
    default:
      return `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(originLabel || origin)}+to+${encodeURIComponent(dest)}+on+${date}`
  }
}

// ── handler ────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const originLabel = searchParams.get('origin') || ''
  const originSkyId = searchParams.get('originSkyId') || ''
  const destSkyId = searchParams.get('destination') || ''
  const destLabel = searchParams.get('destinationLabel') || ''
  const date = searchParams.get('date') || ''

  if (!date || !destSkyId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const originAirports = resolveAirports(originSkyId, originLabel)
  const destAirports = resolveAirports(destSkyId, destLabel)

  // Limit combinations to avoid too many requests
  const origins = originAirports.slice(0, 6)
  const dests = destAirports.slice(0, 4)

  const tasks = origins.flatMap(o =>
    dests.flatMap(d => [fetchRyanair(o, d, date), fetchEasyJet(o, d, date), fetchWizzAir(o, d, date)])
  )

  const settled = await Promise.allSettled(tasks)
  const all: any[] = []
  settled.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value) })

  // Keep cheapest result per airline per origin-dest pair
  const dedup = new Map<string, any>()
  for (const f of all) {
    const key = `${f.airline}-${f.origin}-${destSkyId}`
    if (!dedup.has(key) || f.price < dedup.get(key).price) dedup.set(key, f)
  }

  const flights = [...dedup.values()]
    .sort((a, b) => a.price - b.price)
    .map((o, i) => {
      const durationMins = o.dep && o.arr
        ? Math.round((new Date(o.arr).getTime() - new Date(o.dep).getTime()) / 60000)
        : 0
      return {
        id: String(i),
        price: Number(o.price),
        priceFormatted: `£${Number(o.price).toFixed(2)}`,
        airline: o.airlineName,
        airlineLogo: o.logo,
        airlineCode: o.airline,
        departure: o.dep,
        arrival: o.arr,
        durationMins,
        stops: o.stops,
        originCode: o.origin,
        destCode: destSkyId,
        deepLink: buildDeepLink(o.airline, o.origin, destSkyId, date, originLabel),
      }
    })

  return NextResponse.json({ configured: true, flights })
}
