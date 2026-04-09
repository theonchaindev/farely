let amadeusToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string | null> {
  if (amadeusToken && Date.now() < tokenExpiry) return amadeusToken
  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  try {
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    })
    const data = await res.json()
    if (!data.access_token) return null
    amadeusToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return amadeusToken
  } catch { return null }
}

export function hasAmadeusKeys() {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET)
}

export interface DateFare {
  date: string
  price: number
  currency: string
}

const AIRLINE_NAMES: Record<string, string> = {
  FR: 'Ryanair', U2: 'easyJet', W6: 'Wizz Air', BA: 'British Airways',
  LS: 'Jet2', TP: 'TAP Portugal', IB: 'Iberia', VY: 'Vueling',
  EI: 'Aer Lingus', SK: 'SAS', LH: 'Lufthansa', AF: 'Air France',
  KL: 'KLM', EK: 'Emirates', QR: 'Qatar', TK: 'Turkish Airlines',
}

export function airlineName(code: string) {
  return AIRLINE_NAMES[code] || code
}

export async function getCheapestDates(origin: string, destination: string): Promise<DateFare[]> {
  const token = await getToken()
  if (!token) return []
  try {
    const res = await fetch(
      `https://test.api.amadeus.com/v1/shopping/flight-dates?origin=${origin}&destination=${destination}&oneWay=true&currency=GBP&viewBy=DATE`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || [])
      .map((d: any) => ({ date: d.departureDate, price: parseFloat(d.price.total), currency: 'GBP' }))
      .sort((a: DateFare, b: DateFare) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch { return [] }
}

export async function searchFlightOffers(origin: string, destination: string, date: string) {
  const token = await getToken()
  if (!token) return []
  try {
    const params = new URLSearchParams({ originLocationCode: origin, destinationLocationCode: destination, departureDate: date, adults: '1', currencyCode: 'GBP', max: '10' })
    const res = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map((o: any) => ({
      price: parseFloat(o.price.total),
      currency: 'GBP',
      airline: o.validatingAirlineCodes?.[0] || '??',
      airlineName: airlineName(o.validatingAirlineCodes?.[0] || '??'),
      departure: o.itineraries[0]?.segments[0]?.departure?.at,
      arrival: o.itineraries[0]?.segments[o.itineraries[0].segments.length - 1]?.arrival?.at,
      stops: o.itineraries[0]?.segments.length - 1,
    }))
  } catch { return [] }
}
