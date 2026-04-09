'use client'
import { useEffect, useState, useCallback } from 'react'
import AirportSearch from '@/components/AirportSearch'
import { Airport, getOriginIatas, cityAirports } from '@/lib/airports'

interface Fare {
  date: string
  price: number
  currency: string
  origin: string
  originName: string
  destination: string
  airline: string
  bookingUrl: string
}

interface TrackedRoute {
  id: string
  originCity: string   // "London" or IATA
  destination: string  // IATA
  destCity: string
  destCountry: string
}

function fmt(price: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(price)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#3B82F6" />
      </svg>
      <span className="text-lg font-bold text-slate-900">farely</span>
    </div>
  )
}

function LoadingSpinner() {
  return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
}

function FareGrid({ fares, loading }: { fares: Fare[], loading: boolean }) {
  if (loading) return <div className="py-8"><LoadingSpinner /></div>
  if (!fares.length) return (
    <p className="text-slate-400 text-sm py-6 text-center">No Ryanair fares found for this route in the next 60 days.</p>
  )

  const cheapest = fares[0]?.price

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {fares.slice(0, 20).map((f) => (
        <a
          key={`${f.origin}-${f.date}`}
          href={f.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`group rounded-xl border p-3 hover:shadow-md transition-all ${
            f.price === cheapest
              ? 'border-green-300 bg-green-50 hover:border-green-400'
              : 'border-slate-200 bg-white hover:border-blue-200'
          }`}
        >
          {f.price === cheapest && (
            <div className="text-xs font-semibold text-green-600 mb-1">Cheapest</div>
          )}
          <div className="text-base font-bold text-slate-900">{fmt(f.price)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{fmtDate(f.date)}</div>
          <div className="text-xs text-slate-400 mt-0.5">{f.originName} → {f.destination}</div>
          <div className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Book →
          </div>
        </a>
      ))}
    </div>
  )
}

function RouteCard({
  route,
  onRemove,
}: {
  route: TrackedRoute
  onRemove: (id: string) => void
}) {
  const [fares, setFares] = useState<Fare[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const origins = getOriginIatas(route.originCity).join(',')
    fetch(`/api/search?origins=${origins}&destination=${route.destination}`)
      .then((r) => r.json())
      .then((data) => { setFares(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [route])

  const cheapest = fares[0]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">{route.originCity}</span>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="font-bold text-slate-900 text-lg">{route.destCity}</span>
            <span className="text-slate-400 text-sm">{route.destCountry}</span>
          </div>
          {!loading && cheapest && (
            <p className="text-sm text-slate-500 mt-0.5">
              From <span className="font-semibold text-green-600">{fmt(cheapest.price)}</span> · {cheapest.airline}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(route.id)}
          className="text-slate-300 hover:text-red-400 transition-colors ml-4"
          title="Remove route"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <FareGrid fares={fares} loading={loading} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [routes, setRoutes] = useState<TrackedRoute[]>([])
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [originCity, setOriginCity] = useState('London')
  const [destination, setDestination] = useState<Airport | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('farely-routes') || '[]')
      setRoutes(saved)
    } catch {}
  }, [])

  function saveRoutes(next: TrackedRoute[]) {
    setRoutes(next)
    localStorage.setItem('farely-routes', JSON.stringify(next))
  }

  function addRoute() {
    if (!destination) return
    const city = cityAirports[originCity] ? originCity : (origin?.city || originCity)
    const iatas = getOriginIatas(city)
    if (!iatas.length) return

    const exists = routes.some(
      (r) => r.originCity === city && r.destination === destination.iata
    )
    if (exists) return

    const newRoute: TrackedRoute = {
      id: Math.random().toString(36).slice(2),
      originCity: city,
      destination: destination.iata,
      destCity: destination.city,
      destCountry: destination.country,
    }
    saveRoutes([newRoute, ...routes])
    setDestination(null)
    setAdding(false)
  }

  function removeRoute(id: string) {
    saveRoutes(routes.filter((r) => r.id !== id))
  }

  const londonIsCity = cityAirports[originCity] !== undefined

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <span className="text-xs text-slate-400 hidden sm:block">Prices from Ryanair · updates every 30 min</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Add route bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Track a route</p>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Origin: city or airport selector */}
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">From</label>
              <div className="flex gap-2">
                {/* Quick city buttons */}
                {Object.keys(cityAirports).slice(0, 3).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => { setOriginCity(city); setOrigin(null) }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      originCity === city && !origin
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
                <div className="flex-1">
                  <AirportSearch
                    value={origin}
                    onChange={(a) => { setOrigin(a); if (a) setOriginCity(a.city) }}
                    placeholder="Other airport…"
                  />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">To</label>
              <AirportSearch value={destination} onChange={setDestination} placeholder="Destination airport…" />
            </div>

            <button
              onClick={addRoute}
              disabled={!destination}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              + Track
            </button>
          </div>
          {londonIsCity && (
            <p className="text-xs text-slate-400 mt-2">
              Checking all {cityAirports[originCity].join(', ')} airports
            </p>
          )}
        </div>

        {/* Empty state */}
        {routes.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No routes tracked yet</h3>
            <p className="text-slate-400 text-sm">Add a route above to see upcoming cheap flights.</p>
          </div>
        )}

        {/* Route cards */}
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} onRemove={removeRoute} />
        ))}
      </div>
    </div>
  )
}
