'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
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

interface SavedFlight {
  uid: string
  savedAt: number
  routeLabel: string
  date: string
  leg: 'outbound' | 'return'
  flight: Flight
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

function defaultReturnDate() {
  const d = new Date()
  d.setDate(d.getDate() + 37)
  return d.toISOString().split('T')[0]
}

function flightUid(flight: Flight, date: string, leg: 'outbound' | 'return') {
  const dep = flight.departure ? flight.departure.substring(11, 16) : ''
  return `${flight.airlineCode}-${flight.originCode}-${flight.destCode}-${date}-${dep}-${leg}`
}

// ── Heart icon ─────────────────────────────────────────────────────────────
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

// ── FlightCard ─────────────────────────────────────────────────────────────
function FlightCard({
  flight, date, leg, routeLabel, savedUids, onToggleSave,
}: {
  flight: Flight
  date: string
  leg: 'outbound' | 'return'
  routeLabel: string
  savedUids: Set<string>
  onToggleSave: (f: Flight, date: string, leg: 'outbound' | 'return', routeLabel: string) => void
}) {
  const uid = flightUid(flight, date, leg)
  const saved = savedUids.has(uid)
  const stops = flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
      {/* Airline */}
      <div className="flex items-center gap-3 w-32 shrink-0">
        {flight.airlineLogo ? (
          <img
            src={flight.airlineLogo}
            alt={flight.airline}
            className="w-8 h-8 object-contain rounded"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
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

      {/* Price + actions */}
      <div className="text-right shrink-0 flex items-center gap-2">
        <button
          onClick={() => onToggleSave(flight, date, leg, routeLabel)}
          className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400 hover:bg-rose-50'}`}
          title={saved ? 'Remove from saved' : 'Save flight'}
        >
          <HeartIcon filled={saved} />
        </button>
        <div>
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
    </div>
  )
}

// ── FlightSection ──────────────────────────────────────────────────────────
function FlightSection({
  label, flights, date, leg, routeLabel, savedUids, onToggleSave, cheapest,
}: {
  label: string
  flights: Flight[]
  date: string
  leg: 'outbound' | 'return'
  routeLabel: string
  savedUids: Set<string>
  onToggleSave: (f: Flight, date: string, leg: 'outbound' | 'return', routeLabel: string) => void
  cheapest: Flight | null
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {cheapest && (
          <span className="text-xs text-slate-400">· from <span className="font-semibold text-emerald-600">{cheapest.priceFormatted}</span> on {fmtDate(date)}</span>
        )}
      </div>
      <div className="space-y-2">
        {flights.map(f => (
          <FlightCard
            key={f.id}
            flight={f}
            date={date}
            leg={leg}
            routeLabel={routeLabel}
            savedUids={savedUids}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  )
}

// ── RouteCard ──────────────────────────────────────────────────────────────
function RouteCard({
  route, onRemove, savedUids, onToggleSave,
}: {
  route: TrackedRoute
  onRemove: () => void
  savedUids: Set<string>
  onToggleSave: (f: Flight, date: string, leg: 'outbound' | 'return', routeLabel: string) => void
}) {
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way')
  const [date, setDate] = useState(defaultDate)
  const [returnDate, setReturnDate] = useState(defaultReturnDate)
  const [outbound, setOutbound] = useState<Flight[]>([])
  const [inbound, setInbound] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const routeLabel = `${route.origin.label} → ${route.destination.label}`

  async function search() {
    setLoading(true)
    setError('')
    setSearched(true)
    setOutbound([])
    setInbound([])

    try {
      const outParams = new URLSearchParams({
        origin: route.origin.label,
        originSkyId: route.origin.skyId,
        destination: route.destination.skyId,
        destinationLabel: route.destination.label,
        date,
      })
      const outRes = await fetch(`/api/search?${outParams}`)
      const outData = await outRes.json()
      setOutbound(outData.flights || [])
      if (outData.error) setError(outData.error)

      if (tripType === 'return') {
        const retParams = new URLSearchParams({
          origin: route.destination.label,
          originSkyId: route.destination.skyId,
          destination: route.origin.skyId,
          destinationLabel: route.origin.label,
          date: returnDate,
        })
        const retRes = await fetch(`/api/search?${retParams}`)
        const retData = await retRes.json()
        setInbound(retData.flights || [])
        if (retData.error && !error) setError(retData.error)
      }
    } catch {
      setError('Failed to fetch flights')
    } finally {
      setLoading(false)
    }
  }

  const flag = Object.entries(COUNTRY_FLAG).find(([k]) =>
    route.destination.sublabel?.includes(k)
  )?.[1] ?? '🌍'

  const cheapestOut = outbound.length ? outbound.reduce((a, b) => a.price < b.price ? a : b) : null
  const cheapestIn = inbound.length ? inbound.reduce((a, b) => a.price < b.price ? a : b) : null
  const hasResults = outbound.length > 0 || inbound.length > 0

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
          {cheapestOut && (
            <p className="text-sm text-slate-500 mt-0.5">
              From <span className="font-bold text-emerald-600">{cheapestOut.priceFormatted}</span>
              {' · '}{outbound.length} option{outbound.length !== 1 ? 's' : ''} on {fmtDate(date)}
              {cheapestIn && <> · return from <span className="font-bold text-emerald-600">{cheapestIn.priceFormatted}</span></>}
            </p>
          )}
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1 -mr-1 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 space-y-3">
        {/* Trip type toggle */}
        <div className="flex items-center gap-1 bg-slate-200 rounded-lg p-0.5 w-fit">
          {(['one-way', 'return'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTripType(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all capitalize ${
                tripType === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'one-way' ? 'One way' : 'Return'}
            </button>
          ))}
        </div>

        {/* Date pickers */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={date}
              min={minDate()}
              onChange={e => setDate(e.target.value)}
              className="outline-none text-sm bg-transparent text-slate-700"
            />
          </div>

          {tripType === 'return' && (
            <>
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={returnDate}
                  min={date || minDate()}
                  onChange={e => setReturnDate(e.target.value)}
                  className="outline-none text-sm bg-transparent text-slate-700"
                />
              </div>
            </>
          )}

          <button
            onClick={search}
            disabled={loading || !date || (tripType === 'return' && !returnDate)}
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
      </div>

      {/* Results */}
      <div className="px-5 py-4 space-y-5">
        {!searched && (
          <p className="text-slate-400 text-sm text-center py-6">
            Pick a date and search to see live prices from all airlines.
          </p>
        )}

        {searched && !loading && !hasResults && !error && (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm font-medium">No flights found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different date or check the route exists.</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center py-4">{error}</p>}

        {outbound.length > 0 && (
          <FlightSection
            label={tripType === 'return' ? '→ Outbound' : 'Flights'}
            flights={outbound}
            date={date}
            leg="outbound"
            routeLabel={routeLabel}
            savedUids={savedUids}
            onToggleSave={onToggleSave}
            cheapest={cheapestOut}
          />
        )}

        {inbound.length > 0 && (
          <FlightSection
            label="← Return"
            flights={inbound}
            date={returnDate}
            leg="return"
            routeLabel={routeLabel}
            savedUids={savedUids}
            onToggleSave={onToggleSave}
            cheapest={cheapestIn}
          />
        )}
      </div>
    </div>
  )
}

// ── SavedFlightsPanel ──────────────────────────────────────────────────────
function SavedFlightsPanel({ saved, onRemove }: { saved: SavedFlight[]; onRemove: (uid: string) => void }) {
  if (saved.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="text-rose-400">♥</span> Saved flights ({saved.length})
        </h2>
      </div>
      <div className="px-5 py-4 space-y-3">
        {saved.map(s => (
          <div key={s.uid} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
            {s.flight.airlineLogo && (
              <img
                src={s.flight.airlineLogo}
                alt={s.flight.airline}
                className="w-7 h-7 object-contain rounded"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{s.routeLabel}</p>
              <p className="text-xs text-slate-400">{s.flight.airline} · {fmtDate(s.date)} · {fmtTime(s.flight.departure)} → {fmtTime(s.flight.arrival)}</p>
            </div>
            <div className="text-right shrink-0 flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{s.flight.priceFormatted}</span>
              <a
                href={s.flight.deepLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Book
              </a>
              <button onClick={() => onRemove(s.uid)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [routes, setRoutes] = useState<TrackedRoute[]>([])
  const [origin, setOrigin] = useState<SkyPlace | null>(null)
  const [destination, setDestination] = useState<SkyPlace | null>(null)
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([])

  useEffect(() => {
    try { setRoutes(JSON.parse(localStorage.getItem('farely-routes') || '[]')) } catch {}
    try { setSavedFlights(JSON.parse(localStorage.getItem('farely-saved') || '[]')) } catch {}
  }, [])

  function saveRoutes(next: TrackedRoute[]) {
    setRoutes(next)
    localStorage.setItem('farely-routes', JSON.stringify(next))
  }

  const savedUids = useMemo(() => new Set(savedFlights.map(s => s.uid)), [savedFlights])

  const toggleSave = useCallback((flight: Flight, date: string, leg: 'outbound' | 'return', routeLabel: string) => {
    const uid = flightUid(flight, date, leg)
    setSavedFlights(prev => {
      const next = prev.some(s => s.uid === uid)
        ? prev.filter(s => s.uid !== uid)
        : [...prev, { uid, savedAt: Date.now(), routeLabel, date, leg, flight }]
      localStorage.setItem('farely-saved', JSON.stringify(next))
      return next
    })
  }, [])

  function removeSaved(uid: string) {
    setSavedFlights(prev => {
      const next = prev.filter(s => s.uid !== uid)
      localStorage.setItem('farely-saved', JSON.stringify(next))
      return next
    })
  }

  function addRoute() {
    if (!origin || !destination) return
    if (routes.some(r => r.origin.skyId === origin.skyId && r.destination.skyId === destination.skyId)) return
    saveRoutes([{ id: Date.now().toString(36), origin, destination }, ...routes])
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

        {/* Saved flights */}
        <SavedFlightsPanel saved={savedFlights} onRemove={removeSaved} />

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
            Try:{' '}
            <button
              className="hover:underline text-blue-500"
              onClick={() => setOrigin({ skyId: 'LOND', entityId: '27544008', label: 'London (Any)', sublabel: 'United Kingdom', type: 'CITY' })}
            >
              London (Any)
            </button>
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
            onRemove={() => saveRoutes(routes.filter(r => r.id !== route.id))}
            savedUids={savedUids}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </div>
  )
}
