'use client'
import { useState, useRef, useEffect } from 'react'
import { searchAirports, Airport } from '@/lib/airports'

interface Props {
  value: Airport | null
  onChange: (airport: Airport) => void
  placeholder?: string
}

export default function AirportSearch({ value, onChange, placeholder = 'Search airports…' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleInput(q: string) {
    setQuery(q)
    setResults(q.length > 0 ? searchAirports(q) : [])
    setOpen(true)
  }

  function select(airport: Airport) {
    onChange(airport)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition bg-white">
        <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {value && !query ? (
          <button
            type="button"
            className="flex-1 text-left text-sm"
            onClick={() => { setQuery(''); setOpen(true) }}
          >
            <span className="font-semibold text-slate-900">{value.iata}</span>
            <span className="text-slate-500 ml-1">{value.city}, {value.country}</span>
          </button>
        ) : (
          <input
            type="text"
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={value ? `${value.iata} — ${value.city}` : placeholder}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query && setOpen(true)}
            autoComplete="off"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null as unknown as Airport); setQuery('') }}
            className="ml-1 text-slate-300 hover:text-slate-500"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map((a) => (
            <button
              key={a.iata}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
              onClick={() => select(a)}
            >
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-10 text-center shrink-0">
                {a.iata}
              </span>
              <div>
                <div className="text-sm font-medium text-slate-900">{a.city}</div>
                <div className="text-xs text-slate-400">{a.name}</div>
              </div>
              <span className="ml-auto text-xs text-slate-300">{a.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
