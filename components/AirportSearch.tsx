'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export interface SkyPlace {
  skyId: string
  entityId: string
  label: string       // "London (Any)" or "Faro (FAO)"
  sublabel: string    // "United Kingdom"
  type: 'CITY' | 'AIRPORT' | string
}

interface Props {
  value: SkyPlace | null
  onChange: (place: SkyPlace | null) => void
  placeholder?: string
}

export default function AirportSearch({ value, onChange, placeholder = 'City or airport…' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SkyPlace[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`)
      const data: any[] = await res.json()
      setResults(
        (data || []).map((d) => ({
          skyId: d.skyId,
          entityId: d.entityId,
          label: d.presentation?.suggestionTitle || d.presentation?.title || d.skyId,
          sublabel: d.presentation?.subtitle || '',
          type: d.navigation?.entityType || 'AIRPORT',
        }))
      )
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(q: string) {
    setQuery(q)
    setOpen(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(q), 300)
  }

  function select(place: SkyPlace) {
    onChange(place)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition ${open ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'}`}>
        <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {value && !query ? (
          <button
            type="button"
            className="flex-1 text-left text-sm"
            onClick={() => { setQuery(''); setOpen(true) }}
          >
            <span className="font-semibold text-slate-900">{value.label}</span>
            {value.sublabel && <span className="text-slate-400 ml-1 text-xs">{value.sublabel}</span>}
          </button>
        ) : (
          <input
            type="text"
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-slate-400"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => { if (query) setOpen(true) }}
            autoComplete="off"
          />
        )}

        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-400 rounded-full animate-spin ml-1" />
        )}
        {value && !loading && (
          <button
            type="button"
            onClick={() => { onChange(null); setQuery('') }}
            className="ml-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map((r) => (
            <button
              key={`${r.skyId}-${r.entityId}`}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
              onClick={() => select(r)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${r.type === 'CITY' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {r.type === 'CITY' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{r.label}</div>
                {r.sublabel && <div className="text-xs text-slate-400 truncate">{r.sublabel}</div>}
              </div>
              <span className="ml-auto text-xs text-slate-300 shrink-0">{r.type === 'CITY' ? 'All airports' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
