'use client'
import { useState } from 'react'

interface PricePoint {
  id: string
  price: number
  currency: string
  airline: string
  deepLink: string | null
  checkedAt: string
}

interface Flight {
  id: string
  origin: string
  destination: string
  originCity: string
  destCity: string
  departDate: string
  returnDate: string | null
  isRoundTrip: boolean
  lowestPrice: number | null
  currency: string
  lastChecked: string | null
  priceHistory: PricePoint[]
}

interface Props {
  flight: Flight
  onDelete: (id: string) => void
  onRefresh: (id: string) => void
}

function fmt(price: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function FlightCard({ flight, onDelete, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const latestPrice = flight.priceHistory[0]
  const prevPrice = flight.priceHistory[1]
  const priceChange = latestPrice && prevPrice
    ? latestPrice.price - prevPrice.price
    : null

  async function handleRefresh() {
    setRefreshing(true)
    await onRefresh(flight.id)
    setRefreshing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(flight.id)
  }

  const deepLink = latestPrice?.deepLink || `https://www.google.com/flights?q=${flight.origin}+to+${flight.destination}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{flight.origin}</span>
                <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={flight.isRoundTrip ? "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                </svg>
                <span className="text-xl font-bold text-slate-900">{flight.destination}</span>
              </div>
              {flight.isRoundTrip && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Return</span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {flight.originCity} → {flight.destCity}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {fmtDate(flight.departDate)}
              {flight.returnDate && ` — ${fmtDate(flight.returnDate)}`}
            </p>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            {flight.lowestPrice ? (
              <>
                <div className="text-2xl font-bold text-slate-900">{fmt(flight.lowestPrice, flight.currency)}</div>
                <div className="text-xs text-slate-400">lowest tracked</div>
              </>
            ) : (
              <div className="text-sm text-slate-400">Checking…</div>
            )}
          </div>
        </div>

        {/* Price change indicator */}
        {priceChange !== null && (
          <div className={`inline-flex items-center gap-1 mt-3 text-xs font-medium px-2 py-1 rounded-full ${
            priceChange < 0 ? 'bg-green-50 text-green-700' : priceChange > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'
          }`}>
            {priceChange < 0 ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : priceChange > 0 ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4 4-6 6" />
              </svg>
            ) : null}
            {priceChange === 0
              ? 'No change'
              : `${priceChange < 0 ? 'Down' : 'Up'} ${fmt(Math.abs(priceChange), flight.currency)} since last check`}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
        <div className="text-xs text-slate-400">
          {flight.lastChecked ? `Updated ${fmtRelative(flight.lastChecked)}` : 'Not checked yet'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Checking…' : 'Refresh'}
          </button>
          <span className="text-slate-200">|</span>
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Book now
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <span className="text-slate-200">|</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
