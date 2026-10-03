'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Coins, CircleDollarSign, Loader2, Server, Sparkles, TrendingUp, UserCheck, UserX } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { BarList, ColumnChart, Failed, Panel, Skeleton, Stat, day, emailOf, isActive, num, phoneOf, usd, useAdminData } from './ui'
import { StatusBadge } from './AdminUsers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-2">{label}</dt>
      <dd className="truncate text-right font-semibold text-ink-1">{value}</dd>
    </div>
  )
}

export default function AdminUserDetail({ userId }) {
  const { data, loading, error, reload } = useAdminData(`/admin/users/${encodeURIComponent(userId)}/analytics?includeTokenUsage=true&includeFeatureUsage=true`)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const back = <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink-1"><ArrowLeft size={15} /> All users</Link>

  if (loading && !data) return <div className="space-y-4">{back}<Panel><Skeleton rows={5} /></Panel></div>
  if (error || !data?.user) return <div className="space-y-4">{back}<Panel><Failed error={error || 'User not found.'} onRetry={error ? reload : undefined} /></Panel></div>

  const user = data.user
  const active = isActive(user.status)
  const totals = data.tokenUsage?.totals || {}
  // Backend sends the last 30 days newest first; the chart reads left to right
  const daily = [...(data.tokenUsage?.daily || [])].reverse().map((d) => ({
    key: d.date,
    label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: parseInt(d.tokens, 10) || 0,
    cost: d.cost,
    requests: d.requests,
  }))
  const features = (data.featureUsage || []).map((f) => ({ key: f.function_name || 'unknown', label: f.function_name || 'unknown', value: parseInt(f.usage_count, 10) || 0, tokens: f.tokens_used, cost: f.cost }))

  async function toggle() {
    const next = active ? 'inactive' : 'active'
    setSaving(true)
    setNotice(null)
    try {
      const res = await api(`/admin/users/${encodeURIComponent(userId)}/status`, { method: 'PUT', body: { status: next } })
      setNotice({ ok: true, text: res.message || `User is now ${next}.` })
      await reload()
    } catch (e) {
      setNotice({ ok: false, text: e.message })
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-6">
      {back}

      <div className="grid gap-6 lg:grid-cols-[22rem,1fr]">
        <Panel>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-violet-grad text-lg font-black">{(user.name || user.email || 'U').substring(0, 2).toUpperCase()}</span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-black">{user.name || 'Unknown'}</h1>
              <p className="truncate text-sm text-ink-2">{emailOf(user) || phoneOf(user) || `ID ${user.id}`}</p>
              <div className="mt-1.5"><StatusBadge status={user.status} /></div>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-white/5">
            <Row label="User ID" value={user.id} />
            <Row label="Phone" value={phoneOf(user) || '—'} />
            <Row label="Email" value={emailOf(user) || '—'} />
            {user.auth_provider && <Row label="Signs in with" value={String(user.auth_provider).replace(/^\w/, (c) => c.toUpperCase())} />}
            {user.last_login && <Row label="Last login" value={day(user.last_login)} />}
            <Row label="Plan" value={(user.subscription_plan || 'free').toUpperCase()} />
            <Row label="Joined" value={day(user.created_at)} />
            <Row label="Referrals" value={num(user.referral_count)} />
            {user.referral_code && <Row label="Referral code" value={user.referral_code} />}
            {user.admin_role && <Row label="Admin role" value={String(user.admin_role).replace(/_/g, ' ')} />}
          </dl>

          <div className="mt-5">
            {confirming ? (
              <div className="rounded-2xl border border-line-2 bg-white/5 p-4">
                <p className="text-sm text-ink-1">{active ? 'Deactivate this user? They will not be able to use the app.' : 'Activate this user again?'}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={toggle} disabled={saving}
                    className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60', active ? 'bg-rose text-white' : 'bg-aqua text-cosmos-950')}>
                    {saving && <Loader2 size={15} className="animate-spin" />} Confirm
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} disabled={saving} className="rounded-full border border-line-2 px-4 py-2 text-sm font-semibold text-ink-1 hover:bg-white/5">Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirming(true)}
                className={cn('inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition',
                  active ? 'border-rose/50 text-rose hover:bg-rose/10' : 'border-aqua/50 text-aqua hover:bg-aqua/10')}>
                {active ? <UserX size={16} /> : <UserCheck size={16} />} {active ? 'Deactivate user' : 'Activate user'}
              </button>
            )}
            {notice && <p role="status" className={cn('mt-3 text-sm', notice.ok ? 'text-aqua' : 'text-rose')}>{notice.text}</p>}
          </div>
        </Panel>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Tokens" value={num(totals.total_tokens)} hint="Lifetime" icon={Coins} />
            <Stat label="LLM cost" value={usd(totals.total_cost)} hint="Lifetime" icon={CircleDollarSign} />
            <Stat label="Requests" value={num(totals.total_requests)} hint="Lifetime" icon={Server} />
          </div>

          <Panel title="Tokens per day" icon={TrendingUp} action={<span className="text-xs text-ink-3">Last {daily.length} active days</span>}>
            <ColumnChart rows={daily} />
            {daily.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-ink-2 hover:text-ink-1">Show as table</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase tracking-wider text-ink-3"><tr><th className="py-1.5">Day</th><th className="py-1.5 text-right">Tokens</th><th className="py-1.5 text-right">Requests</th><th className="py-1.5 text-right">Cost</th></tr></thead>
                    <tbody className="divide-y divide-white/5 tabular-nums text-ink-2">
                      {[...daily].reverse().map((d) => (
                        <tr key={d.key}><td className="py-1.5">{d.label}</td><td className="py-1.5 text-right">{num(d.value)}</td><td className="py-1.5 text-right">{num(d.requests)}</td><td className="py-1.5 text-right">{usd(d.cost)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </Panel>

          <Panel title="Feature usage (requests)" icon={Sparkles}>
            <BarList rows={features.slice(0, 10)} empty="This user hasn't used any AI features yet." />
          </Panel>
        </div>
      </div>
    </div>
  )
}
