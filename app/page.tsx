import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#3B82F6" />
          </svg>
          <span className="text-xl font-bold text-slate-900">farely</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Live price tracking
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Track flights.<br />
          <span className="text-blue-600">Fly for less.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Add any route and Farely watches prices 24/7. When fares drop, you&apos;ll be the first to know.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Start tracking for free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ),
              title: 'Price alerts',
              desc: 'Know instantly when your tracked routes drop to a new low.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: 'Price history',
              desc: 'See how fares have moved over time so you know when to book.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Any route',
              desc: 'Track flights between 100+ airports worldwide, one-way or return.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 px-6 text-center">
        <p className="text-slate-400 text-sm">© 2025 Farely. Prices shown are indicative — purchase via airlines or booking sites.</p>
      </footer>
    </div>
  )
}
