'use client'
import { useEffect, useState } from 'react'
import AirportSearch, { SkyPlace } from '@/components/AirportSearch'

interface TrackedRoute {
  id: string
  origin: SkyPlace
  destination: SkyPlace
}

interface Flight {
  id: string
  price: number
  priceFormatted: string
  airline: string
  airlineLogo: string | null
  airlineCode: string
  departure: string
  arrival: string
  durationMins: number
  stops: number
  originCode: string
  destCode: string
  deepLink: string
}

const COUNTRY_FLAG: Record<string, string> = {
  'United Kingdom': '🇬🇧', 'Portugal': '🇵🇹', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Greece': '🇬🇷', 'Germany': '🇩🇪', 'Netherlands': '🇳🇱',
  'United States': '🇺🇸', 'UAE': '🇦🇪', 'Japan': '🇯🇵', 'Thailand': '🇹🇭',
  'Australia': '🇦🇺', 'Turkey': '🇹🇷', 'Morocco': '🇲🇦', 'Maldives': '🇲🇻',
  'Ireland': '🇮🇪', 'Croatia': '🇭🇷', 'Malta': '🇲🇹', 'Cyprus': '🇨🇾',
}

function fmtTime(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDuration(mins: number) {
  if (!mins) return ''
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function fmtDate(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function minDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function defaultDate() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

function NoKeyBanner() {
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
      <div className="flex gap-3">
        <span className="text-xl">🔑</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Add your Amadeus API key to see live prices</p>
          <ol className="text-xs text-amber-800 mt-1.5 space-y-1 list-decimal list-inside">
            <li>Sign up free at <a href="https://developers.amadeus.com" target="_blank" rel="noopener noreferrer" className="underline">developers.amadeus.com</a></li>
            <li>Create a self-service app → copy your Client ID &amp; Secret</li>
            <li>Add <code className="bg-amber-100 px-1 rounded">AMADEUS_CLIENT_ID</code> and <code className="bg-amber-100 px-1 rounded">AMADEUS_CLIENT_SECRET</code> to Vercel env vars</li>
            <li>Redeploy</li>
          </ol>
          <p className="text-xs text-amber-600 mt-1.5">Free tier: 2,000 API calls/month — no credit card needed.</p>
        </div>
      </div>
    </div>
  )
}

function FlightCard({ flight }: { flight: Flight }) {
  const stops = flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
      {/* Airline */}
      <div className="flex items-center gap-3 w-36 shrink-0">
        {flight.airlineLogo ? (
          <img src={flight.airlineLogo} alt={flight.airline} className="w-8 h-8 object-contain rounded" />
        ) : (
          <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-500">
            {flight.airlineCode}
          </div>
        )}
        <span className="text-xs font-medium text-slate-600 leading-tight">{flight.airline}</span>
      </div>

      {/* Route */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{fmtTime(flight.departure)}</div>
          <div className="text-xs text-slate-400">{flight.originCode}</div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-slate-400">{fmtDuration(flight.durationMins)}</div>
          <div className="w-full flex items-center gap-1">
            <div className="h-px bg-slate-300 flex-1" />
            <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${flight.stops === 0 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
              {stops}
            </div>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{fmtTime(flight.arrival)}</div>
          <div className="text-xs text-slate-400">{flight.destCode}</div>
        </div>
      </div>

      {/* Price + Book */}
      <div className="text-right shrink-0">
        <div className="text-xl font-bold text-slate-900">{flight.priceFormatted}</div>
        <a
          href={flight.deepLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Book →
        </a>
      </div>
    </div>
  )
}

function RouteCard({ route, onRemove }: { route: TrackedRoute; onRemove: () => void }) {
  const [date, setDate] = useState(defaultDate)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const params = new URLSearchParams({
        origin: route.origin.label,
        originSkyId: route.origin.skyId,
        destination: route.destination.skyId,
        date,
      })
      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setFlights(data.flights || [])
      if (data.error) setError(data.error)
    } catch {
      setError('Failed to fetch flights')
    } finally {
      setLoading(false)
    }
  }

  const flag = Object.entries(COUNTRY_FLAG).find(([k]) =>
    route.destination.sublabel?.includes(k)
  )?.[1] ?? '🌍'

  const cheapest = flights.length ? flights.reduce((a, b) => a.price < b.price ? a : b) : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-slate-900">{route.origin.label}</span>
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-xl font-bold text-slate-900">{route.destination.label}</span>
            <span className="text-xl">{flag}</span>
          </div>
          {cheapest && (
            <p className="text-sm text-slate-500 mt-0.5">
              From <span className="font-bold text-emerald-600">{cheapest.priceFormatted}</span>
              {' · '}{flights.length} option{flights.length !== 1 ? 's' : ''} on {fmtDate(date)}
            </p>
          )}
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1 -mr-1 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={date}
            min={minDate()}
            onChange={e => setDate(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent text-slate-700"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !date}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Searching…
            </>
          ) : 'Search flights'}
        </button>
      </div>

      {/* Results */}
      <div className="px-5 py-4">
        {!searched && (
          <p className="text-slate-400 text-sm text-center py-6">
            Pick a date and search to see live prices from all airlines.
          </p>
        )}

        {searched && loading === false && flights.length === 0 && !error && (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm font-medium">No flights found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different date or check the route exists.</p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center py-4">{error}</p>
        )}

        {flights.length > 0 && (
          <div className="space-y-2">
            {flights.map(f => <FlightCard key={f.id} flight={f} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [routes, setRoutes] = useState<TrackedRoute[]>([])
  const [origin, setOrigin] = useState<SkyPlace | null>(null)
  const [destination, setDestination] = useState<SkyPlace | null>(null)

  useEffect(() => {
    try { setRoutes(JSON.parse(localStorage.getItem('farely-routes') || '[]')) } catch {}
  }, [])

  function save(next: TrackedRoute[]) {
    setRoutes(next)
    localStorage.setItem('farely-routes', JSON.stringify(next))
  }

  function addRoute() {
    if (!origin || !destination) return
    if (routes.some(r => r.origin.skyId === origin.skyId && r.destination.skyId === destination.skyId)) return
    save([{ id: Date.now().toString(36), origin, destination }, ...routes])
    setOrigin(null)
    setDestination(null)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#2563EB" />
            </svg>
            <span className="text-xl font-bold text-slate-900 tracking-tight">farely</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Live flight prices · all airlines</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Add route */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Track a route</h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">From</label>
              <AirportSearch value={origin} onChange={setOrigin} placeholder="City or airport…" />
            </div>
            <div className="hidden sm:flex items-end pb-2.5">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5">To</label>
              <AirportSearch value={destination} onChange={setDestination} placeholder="City or airport…" />
            </div>
            <button
              onClick={addRoute}
              disabled={!origin || !destination}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              + Track
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Try: <button className="hover:underline text-blue-500" onClick={() => {
              setOrigin({ skyId: 'LOND', entityId: '27544008', label: 'London (Any)', sublabel: 'United Kingdom', type: 'CITY' })
            }}>London (Any)</button>
            {' → search "Faro" for destination'}
          </p>
        </div>

        {/* Empty state */}
        {routes.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-14 text-center">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Track your first flight</h3>
            <p className="text-slate-400 text-sm">Search any origin and destination above, then pick a date to see live prices.</p>
          </div>
        )}

        {/* Route cards */}
        {routes.map(route => (
          <RouteCard
            key={route.id}
            route={route}
            onRemove={() => save(routes.filter(r => r.id !== route.id))}
          />
        ))}
      </div>
    </div>
  )
}
