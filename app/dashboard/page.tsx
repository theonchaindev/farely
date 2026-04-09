'use client'
import { useEffect, useState } from 'react'
import FlightCard from '@/components/FlightCard'
import AddFlightModal from '@/components/AddFlightModal'

export default function Dashboard() {
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function loadFlights() {
    const res = await fetch('/api/flights')
    if (res.ok) setFlights(await res.json())
  }

  useEffect(() => {
    loadFlights().then(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/flights/${id}`, { method: 'DELETE' })
    setFlights((f) => f.filter((x) => x.id !== id))
  }

  async function handleRefresh(id: string) {
    const res = await fetch('/api/prices/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightId: id }),
    })
    if (res.ok) loadFlights()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#3B82F6" /></svg>
            <span className="text-lg font-bold text-slate-900">farely</span>
          </div>
          <span className="text-sm text-slate-400">Track flights, fly for less</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your flights</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {flights.length === 0
                ? 'No flights tracked yet'
                : `${flights.length} route${flights.length !== 1 ? 's' : ''} tracked`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Track flight
          </button>
        </div>

        {/* Empty state */}
        {flights.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Start tracking a flight</h3>
            <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">
              Add a route and we&apos;ll watch the prices 24/7. Hit the low? We&apos;ll let you know.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Add your first flight
            </button>
          </div>
        )}

        {/* Flight cards */}
        <div className="space-y-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <AddFlightModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); loadFlights() }}
        />
      )}
    </div>
  )
}
