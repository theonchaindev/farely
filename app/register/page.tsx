'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M24 4L4 14L12 16L14 24L24 4Z" fill="#3B82F6" /></svg>
        <span className="text-lg font-bold text-slate-900">farely</span>
      </Link>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-6">Start tracking flights for free</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text" required autoFocus
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              placeholder="Minimum 8 characters"
              minLength={8}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-slate-500 text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
