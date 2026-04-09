import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get('q') || ''
  if (!query || query.length < 2) return NextResponse.json([])

  const key = process.env.RAPIDAPI_KEY
  if (!key) return NextResponse.json([])

  try {
    const res = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-GB`,
      {
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(data.data || [])
  } catch {
    return NextResponse.json([])
  }
}
