'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Chips, Failed, Panel, Skeleton, day, emailOf, isActive, num, phoneOf, usd, useAdminData } from './ui'

const LIMIT = 20

export function StatusBadge({ status }) {
  const on = isActive(status)
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
      on ? 'bg-aqua/15 text-aqua' : 'bg-rose/15 text-rose')}>
      <span className={cn('h-1.5 w-1.5 rounded-full', on ? 'bg-aqua' : 'bg-rose')} aria-hidden="true" />
      {on ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(null)
  const [plan, setPlan] = useState(null)
  const [search, setSearch] = useState('')

  const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
  if (status) qs.set('status', status)
  if (plan) qs.set('plan', plan)
  const { data, loading, error, reload } = useAdminData(`/admin/users?${qs}`)

  const pagination = data?.pagination || { currentPage: page, totalPages: 1, totalUsers: 0 }
  const users = data?.users || []
  // The backend has no search parameter, so search filters the page that is loaded (as in the app)
  const s = search.trim().toLowerCase()
  const shown = s
    ? users.filter((u) => u.name?.toLowerCase().includes(s) || emailOf(u)?.toLowerCase().includes(s) || phoneOf(u)?.replace(/\s/g, '').includes(s.replace(/\s/g, '')) || String(u.id) === s)
    : users

  const pick = (setter) => (v) => { setter(v); setPage(1) }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Users</h1>

      <Panel>
        <div className="flex flex-col gap-4">
          <label className="relative block">
            <span className="sr-only">Search users on this page</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search this page by name, email, phone or ID"
              className="w-full rounded-full border-line-2 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-ink-1 placeholder:text-ink-3 focus:border-gold focus:ring-gold" />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1" aria-label="Clear search"><X size={16} /></button>
            )}
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Chips label="Status" value={status} onChange={pick(setStatus)}
              options={[{ value: null, label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            <Chips label="Plan" value={plan} onChange={pick(setPlan)}
              options={[{ value: null, label: 'All' }, { value: 'free', label: 'Free' }, { value: 'premium', label: 'Premium' }]} />
          </div>
        </div>
      </Panel>

      <Panel title={`Users (${num(pagination.totalUsers)})`} icon={Users}
        action={<span className="text-xs font-semibold text-ink-3">Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}</span>}>
        {error ? (
          <Failed error={error} onRetry={reload} />
        ) : loading && !data ? (
          <Skeleton rows={6} />
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-2">No users found.</p>
        ) : (
          <div className={cn('-mx-2 overflow-x-auto transition-opacity', loading && 'opacity-60')}>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-3">
                <tr>
                  <th className="px-2 py-2 font-semibold">User</th>
                  <th className="px-2 py-2 font-semibold">Phone</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold">Plan</th>
                  <th className="px-2 py-2 text-right font-semibold">Referrals</th>
                  <th className="px-2 py-2 text-right font-semibold">Tokens</th>
                  <th className="px-2 py-2 text-right font-semibold">LLM cost</th>
                  <th className="px-2 py-2 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shown.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-2 py-3">
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-grad text-sm font-black">{(u.name || u.email || '?').charAt(0).toUpperCase()}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink-1 hover:text-gold-soft">{u.name || 'Unknown'}</span>
                          <span className="block truncate text-xs text-ink-3">{emailOf(u) || `ID ${u.id}`}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap tabular-nums text-ink-1">{phoneOf(u) || <span className="text-ink-3">—</span>}</td>
                    <td className="px-2 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-2 py-3 capitalize text-ink-2">{u.subscription_plan || 'free'}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-ink-2">{num(u.referral_count)}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-ink-2">{num(u.total_tokens_used)}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-ink-2">{usd(u.total_cost)}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-ink-2">{day(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-line-2 px-3 py-1.5 text-sm font-semibold text-ink-1 hover:bg-white/5 disabled:opacity-40">
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm tabular-nums text-ink-2">{pagination.currentPage} / {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-line-2 px-3 py-1.5 text-sm font-semibold text-ink-1 hover:bg-white/5 disabled:opacity-40">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Panel>
    </div>
  )
}
