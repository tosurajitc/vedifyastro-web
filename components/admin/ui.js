'use client'

import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'

// Number helpers. The backend returns SUM()/COUNT() as strings and LLM cost in US dollars.
export const num = (n) => (parseInt(n, 10) || 0).toLocaleString('en-IN')
export const usd = (n, digits = 4) => `$${(parseFloat(n) || 0).toFixed(digits)}`
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

// users.is_active comes back as `status`: a boolean from the backend, 'active'/'inactive' after a toggle
export const isActive = (status) => status === true || status === 'active'

// Phone sign-ups store their number in users.phone_number (older rows in users.phone) and get a
// placeholder email <number>@vedifyastro.app, which is hidden here
export const phoneOf = (u) => u?.phone_number || u?.phone || null
export const emailOf = (u) => (u?.email && !u.email.endsWith('@vedifyastro.app') ? u.email : null)

// Loads an admin endpoint; reload() refetches it
export function useAdminData(path) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await api(path)
      setState({ loading: false, data: res.data, error: null })
    } catch (e) {
      setState({ loading: false, data: null, error: e.message })
    }
  }, [path])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}

export function Panel({ title, icon: Icon, action, className, children }) {
  return (
    <section className={cn('glass rounded-[1.5rem] p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-gold">{Icon && <Icon size={16} />} {title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="glass rounded-[1.25rem] p-4 sm:p-5">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-2">{Icon && <Icon size={14} className="text-gold" />} {label}</p>
      <p className="mt-2 font-display text-2xl font-black tabular-nums text-ink-1 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  )
}

export function Skeleton({ rows = 3, className }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="h-5 animate-pulse rounded-full bg-white/10" style={{ width: `${90 - i * 12}%` }} />)}
    </div>
  )
}

export function Failed({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-ink-2">
      <p>{error || 'Not available right now.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 font-semibold text-ink-1 hover:bg-white/5">
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

export function Chips({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {label && <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</span>}
      {options.map((o) => (
        <button key={String(o.value)} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold transition',
            value === o.value ? 'border-gold/60 bg-gold/15 text-gold-soft' : 'border-line-2 text-ink-2 hover:bg-white/5 hover:text-ink-1')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Single-series horizontal bars: label, bar, value. Every bar carries its value as text, so no legend
// is needed; the native tooltip repeats the exact figure.
export function BarList({ rows, format = num, empty = 'No data yet.' }) {
  if (!rows.length) return <p className="text-sm text-ink-2">{empty}</p>
  const max = Math.max(...rows.map((r) => r.value), 0) || 1
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,9rem),1fr,auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem),1fr,auto]" title={`${r.label}: ${format(r.value)}`}>
          <span className="truncate text-ink-1">{r.label}</span>
          <span className="h-2.5 rounded-full bg-white/5">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max((r.value / max) * 100, r.value > 0 ? 2 : 0)}%` }} />
          </span>
          <span className="text-right tabular-nums text-ink-2">{format(r.value)}</span>
        </li>
      ))}
    </ul>
  )
}

// Single-series vertical bars over time (oldest left), with the value shown on hover and in the table below
export function ColumnChart({ rows, format = num }) {
  if (!rows.length) return <p className="text-sm text-ink-2">No activity yet.</p>
  const max = Math.max(...rows.map((r) => r.value), 0) || 1
  return (
    <div>
      <div className="flex h-40 items-end gap-[2px]" role="img" aria-label={`Bar chart, ${rows.length} days`}>
        {rows.map((r) => (
          <div key={r.key} className="group relative flex h-full flex-1 items-end" title={`${r.label}: ${format(r.value)}`}>
            <div className="w-full rounded-t bg-gold transition group-hover:bg-gold-soft" style={{ height: `${Math.max((r.value / max) * 100, r.value > 0 ? 2 : 0)}%` }} />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-cosmos-800 px-2 py-1 text-xs text-ink-1 shadow-glow group-hover:block">
              {r.label} · {format(r.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-3">
        <span>{rows[0].label}</span>
        <span>{rows[rows.length - 1].label}</span>
      </div>
    </div>
  )
}
