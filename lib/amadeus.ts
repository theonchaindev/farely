let amadeusToken: string | null = null
let tokenExpiry: number = 0

async function getToken(): Promise<string | null> {
  if (amadeusToken && Date.now() < tokenExpiry) return amadeusToken

  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    const data = await res.json()
    amadeusToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return amadeusToken
  } catch {
    return null
  }
}

export interface FlightOffer {
  price: number
  currency: string
  airline: string
  deepLink: string
}

export async function getCheapestFlight(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
): Promise<FlightOffer | null> {
  const token = await getToken()
  if (!token) {
    // Return mock data when no API key configured
    return {
      price: Math.floor(Math.random() * 400) + 80,
      currency: 'GBP',
      airline: 'Various',
      deepLink: `https://www.google.com/flights?q=${origin}+to+${destination}`,
    }
  }

  try {
    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departDate,
      adults: '1',
      currencyCode: 'GBP',
      max: '5',
    })
    if (returnDate) params.set('returnDate', returnDate)

    const res = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    const offer = data.data?.[0]
    if (!offer) return null

    return {
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      airline: offer.validatingAirlineCodes?.[0] || 'Various',
      deepLink: `https://www.google.com/flights?q=${origin}+to+${destination}`,
    }
  } catch {
    return null
  }
}
