'use client'
import { useState } from 'react'
import AirportSearch from './AirportSearch'
import { Airport } from '@/lib/airports'

interface Props {
  onClose: () => void
  onAdded: () => void
}

export default function AddFlightModal({ onClose, onAdded }: Props) {
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [destination, setDestination] = useState<Airport | null>(null)
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!origin || !destination) { setError('Select both airports'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: origin.iata,
        destination: destination.iata,
        departDate,
        returnDate: isRoundTrip ? returnDate : undefined,
        isRoundTrip,
      }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return }
    onAdded()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Track a flight</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Trip type */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              type="button"
              className={`flex-1 py-2 font-medium transition-colors ${!isRoundTrip ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setIsRoundTrip(false)}
            >
              One-way
            </button>
            <button
              type="button"
              className={`flex-1 py-2 font-medium transition-colors ${isRoundTrip ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setIsRoundTrip(true)}
            >
              Return
            </button>
          </div>

          {/* Airports */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">From</label>
            <AirportSearch value={origin} onChange={setOrigin} placeholder="Departure airport" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">To</label>
            <AirportSearch value={destination} onChange={setDestination} placeholder="Destination airport" />
          </div>

          {/* Dates */}
          <div className={`grid gap-3 ${isRoundTrip ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Depart</label>
              <input
                type="date" required min={today}
                value={departDate} onChange={(e) => setDepartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              />
            </div>
            {isRoundTrip && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Return</label>
                <input
                  type="date" min={departDate || today}
                  value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'Adding…' : 'Track flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
