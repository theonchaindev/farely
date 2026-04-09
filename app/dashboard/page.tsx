'use client'
import { useEffect, useState } from 'react'
import AirportSearch from '@/components/AirportSearch'
import { Airport } from '@/lib/airports'

interface DateFare { date: string; price: number; currency: string }
interface TrackedRoute {
  id: string
  originCity: string
  originCode: string   // Amadeus city code e.g. "LON"
  destination: string  // IATA
  destCity: string
  destCountry: string
  destFlag: string
}

const CITY_CODE: Record<string, string> = {
  London: 'LON', Paris: 'PAR', 'New York': 'NYC', Milan: 'MIL', Tokyo: 'TYO',
}

const COUNTRY_FLAG: Record<string, string> = {
  PT: '🇵🇹', ES: '🇪🇸', IT: '🇮🇹', FR: '🇫🇷', GR: '🇬🇷', DE: '🇩🇪', NL: '🇳🇱',
  US: '🇺🇸', AE: '🇦🇪', JP: '🇯🇵', TH: '🇹🇭', AU: '🇦🇺', TR: '🇹🇷', MA: '🇲🇦',
  MV: '🇲🇻', GB: '🇬🇧', IE: '🇮🇪', HR: '🇭🇷', ME: '🇲🇪', MT: '🇲🇹', CY: '🇨🇾',
  MX: '🇲🇽', BR: '🇧🇷', IN: '🇮🇳', SG: '🇸🇬', HK: '🇭🇰', KR: '🇰🇷', CN: '🇨🇳',
}

const AIRLINES = [
  { name: 'Google Flights', color: '#4285F4', url: (o: string, d: string) => `https://www.google.com/travel/flights/search?tfs=CBwQARoeEgoyMDI1LTA0LTEwagcIARIDLWFscGhhcgcIARID${btoa(d)}` },
  { name: 'Skyscanner', color: '#0770E3', url: (o: string, d: string) => `https://www.skyscanner.net/transport/flights/${o.toLowerCase()}/${d.toLowerCase()}/` },
  { name: 'Ryanair', color: '#003580', url: (o: string, d: string) => `https://www.ryanair.com/gb/en/trip/flights/select?adults=1&originIata=${o}&destinationIata=${d}&isReturn=false` },
  { name: 'easyJet', color: '#FF6600', url: (o: string, d: string) => `https://www.easyjet.com/en/search?ADT=1&CHD=0&INF=0&origin=${o}&destination=${d}` },
  { name: 'Jet2', color: '#003DA5', url: (o: string, d: string) => `https://www.jet2.com/flights?departureAirport=${o}&destinationAirport=${d}` },
  { name: 'Wizz Air', color: '#C5148C', url: (o: string, d: string) => `https://wizzair.com/en-gb/search#/search/one-way/${o}/${d}/2025-06-01/null/1/0/0/null` },
  { name: 'British Airways', color: '#075AAA', url: (o: string, d: string) => `https://www.britishairways.com/travel/fx/public/en_gb?eId=106004&from=${o}&to=${d}` },
  { name: 'Kayak', color: '#FF690F', url: (o: string, d: string) => `https://www.kayak.com/flights/${o}-${d}/?sort=price_a` },
]

function fmt(price: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(price)
}

function fmtShortDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtDayName(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' })
}

function getPriceColor(price: number, min: number, max: number) {
  const pct = max === min ? 0 : (price - min) / (max - min)
  if (pct < 0.33) return 'bg-emerald-50 border-emerald-200 text-emerald-800'
  if (pct < 0.66) return 'bg-amber-50 border-amber-200 text-amber-800'
  return 'bg-rose-50 border-rose-200 text-rose-800'
}

function SetupBanner({ originCity, destination }: { originCity: string; destination: string }) {
  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">Enable live prices from all airlines</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Add a free Amadeus API key to see Ryanair, easyJet, BA, Jet2, Wizz and more — updated daily.
          </p>
          <a
            href="https://developers.amadeus.com/get-started/get-started-with-self-service-apis-335"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 hover:underline"
          >
            Get free API key → (3 minutes)
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-xs text-blue-500 mt-1">Then add <code className="bg-blue-100 px-1 rounded">AMADEUS_CLIENT_ID</code> and <code className="bg-blue-100 px-1 rounded">AMADEUS_CLIENT_SECRET</code> to Vercel env vars and redeploy.</p>
        </div>
      </div>
    </div>
  )
}

function PriceCalendar({ fares }: { fares: DateFare[] }) {
  if (!fares.length) return (
    <p className="text-slate-400 text-sm py-4 text-center">No upcoming fares found for this route.</p>
  )

  const min = Math.min(...fares.map(f => f.price))
  const max = Math.max(...fares.map(f => f.price))
  const cheapest = fares.find(f => f.price === min)

  return (
    <div>
      {cheapest && (
        <p className="text-xs text-slate-500 mb-3">
          Cheapest: <span className="font-bold text-emerald-600">{fmt(min)}</span> on {fmtShortDate(cheapest.date)}
          {' · '}<span className="text-slate-400">Showing next {fares.length} dates</span>
        </p>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
        {fares.slice(0, 30).map((f) => (
          <div
            key={f.date}
            className={`rounded-lg border p-2 text-center cursor-default ${getPriceColor(f.price, min, max)}`}
          >
            <div className="text-xs opacity-60">{fmtDayName(f.date)}</div>
            <div className="text-xs font-medium">{fmtShortDate(f.date)}</div>
            <div className="text-sm font-bold mt-0.5">{fmt(f.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AirlineLinks({ originCode, destination, destCity }: { originCode: string; destination: string; destCity: string }) {
  // Use the primary origin airport code (first London airport = STN for Ryanair etc)
  const originAirport = originCode === 'LON' ? 'STN' : originCode

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Search by airline</p>
      <div className="flex flex-wrap gap-2">
        {AIRLINES.map((a) => {
          let url: string
          try { url = a.url(originAirport, destination) } catch { url = '#' }
          return (
            <a
              key={a.name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
              {a.name}
            </a>
          )
        })}
      </div>
    </div>
  )
}

function RouteCard({ route, onRemove }: { route: TrackedRoute; onRemove: (id: string) => void }) {
  const [fares, setFares] = useState<DateFare[]>([])
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/search?origin=${encodeURIComponent(route.originCity)}&destination=${route.destination}`)
      .then(r => r.json())
      .then(data => {
        setConfigured(data.configured)
        setFares(data.fares || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [route])

  const cheapest = fares.length ? Math.min(...fares.map(f => f.price)) : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-slate-900">{route.originCity}</span>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-xl font-bold text-slate-900">{route.destCity}</span>
            <span className="text-xl">{route.destFlag}</span>
          </div>
          <p className="text-sm text-slate-400">
            {route.destination} · {route.destCountry}
            {cheapest && (
              <span className="ml-2 text-emerald-600 font-semibold">from {fmt(cheapest)}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => onRemove(route.id)}
          className="text-slate-300 hover:text-red-400 transition-colors p-1 -mr-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            Loading prices…
          </div>
        ) : configured === false ? (
          <SetupBanner originCity={route.originCity} destination={route.destination} />
        ) : (
          <PriceCalendar fares={fares} />
        )}

        <AirlineLinks originCode={route.originCode} destination={route.destination} destCity={route.destCity} />
      </div>
    </div>
  )
}

const ORIGIN_CITIES = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Other']

export default function Dashboard() {
  const [routes, setRoutes] = useState<TrackedRoute[]>([])
  const [originCity, setOriginCity] = useState('London')
  const [destination, setDestination] = useState<Airport | null>(null)
  const [showCityPicker, setShowCityPicker] = useState(false)

  useEffect(() => {
    try { setRoutes(JSON.parse(localStorage.getItem('farely-routes') || '[]')) } catch {}
  }, [])

  function save(next: TrackedRoute[]) {
    setRoutes(next)
    localStorage.setItem('farely-routes', JSON.stringify(next))
  }

  function addRoute() {
    if (!destination) return
    const originCode = CITY_CODE[originCity] || originCity.slice(0, 3).toUpperCase()
    if (routes.some(r => r.originCity === originCity && r.destination === destination.iata)) return
    save([{
      id: Date.now().toString(36),
      originCity,
      originCode,
      destination: destination.iata,
      destCity: destination.city,
      destCountry: destination.country,
      destFlag: COUNTRY_FLAG[destination.country] || '🌍',
    }, ...routes])
    setDestination(null)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#2563EB" />
            </svg>
            <span className="text-xl font-bold text-slate-900 tracking-tight">farely</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Flight price tracker</p>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Search card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Track a route</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* From */}
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1.5">From</label>
              <div className="relative">
                <button
                  onClick={() => setShowCityPicker(!showCityPicker)}
                  className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 bg-white hover:border-slate-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {originCity}
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCityPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                    {ORIGIN_CITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setOriginCity(c === 'Other' ? '' : c); setShowCityPicker(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${originCity === c ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden sm:flex items-end pb-2.5">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* To */}
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1.5">To</label>
              <AirportSearch value={destination} onChange={setDestination} placeholder="e.g. Faro, Malaga, Ibiza…" />
            </div>

            <div className="sm:flex sm:items-end">
              <button
                onClick={addRoute}
                disabled={!destination || !originCity}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Track
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {routes.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <div className="text-4xl mb-3">✈️</div>
            <h3 className="font-semibold text-slate-800 mb-1">No routes tracked yet</h3>
            <p className="text-slate-400 text-sm">Pick a departure city and destination above to start.</p>
            <p className="text-slate-300 text-xs mt-1">Try: London → Faro</p>
          </div>
        )}

        {/* Route cards */}
        {routes.map(route => (
          <RouteCard key={route.id} route={route} onRemove={id => save(routes.filter(r => r.id !== id))} />
        ))}
      </div>
    </div>
  )
}
