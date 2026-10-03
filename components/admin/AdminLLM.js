'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CalendarDays, ChartBar, Coins, CircleDollarSign, Server, Table, Tag, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BarList, Chips, ColumnChart, Failed, Panel, Skeleton, Stat, num, usd, useAdminData } from './ui'

const GROUPS = [{ value: 'date', label: 'Day' }, { value: 'function', label: 'Feature' }, { value: 'endpoint', label: 'Endpoint' }, { value: 'user', label: 'User' }]
const RANGES = [{ value: 1, label: 'Today' }, { value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }, { value: 0, label: 'All time' }, { value: 'custom', label: 'Custom' }]
const METRICS = [{ value: 'cost', label: 'Cost' }, { value: 'tokens', label: 'Tokens' }, { value: 'requests', label: 'Requests' }]

// Days are IST calendar days (the backend groups by the IST date); strings are YYYY-MM-DD
const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
const isYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s))
const shortDay = (ymd) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDay = (ymd) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default function AdminLLM() {
  const today = istToday()
  const [groupBy, setGroupBy] = useState('date')
  const [range, setRange] = useState(30)
  const [from, setFrom] = useState(addDays(today, -29))
  const [to, setTo] = useState(today)
  const [metric, setMetric] = useState('cost')

  // Inclusive IST day bounds sent as exact instants, e.g. 2026-10-01T00:00:00+05:30
  let start = null
  let end = null
  if (range === 'custom') {
    if (from && to) [start, end] = from <= to ? [from, to] : [to, from]
  } else if (range) {
    start = addDays(today, -(range - 1))
    end = today
  }
  const qs = new URLSearchParams({ groupBy })
  if (start && end) {
    qs.set('startDate', `${start}T00:00:00+05:30`)
    qs.set('endDate', `${end}T23:59:59.999+05:30`)
  }
  const { data, loading, error, reload } = useAdminData(`/admin/llm/analytics?${qs}`)

  const rows = useMemo(() => data?.analytics || [], [data])
  const totals = data?.totals || {}
  const pricing = data?.pricing
  const groupLabel = GROUPS.find((g) => g.value === groupBy).label

  // Rows are per group *and* model; merge them into one entry per group
  const merged = useMemo(() => {
    const m = new Map()
    for (const r of rows) {
      const key = String(r.group_key ?? 'unknown')
      const cur = m.get(key) || { key, cost: 0, tokens: 0, input: 0, output: 0, requests: 0, models: new Set() }
      cur.cost += parseFloat(r.total_cost) || 0
      cur.tokens += parseInt(r.total_tokens, 10) || 0
      cur.input += parseInt(r.total_input_tokens, 10) || 0
      cur.output += parseInt(r.total_output_tokens, 10) || 0
      cur.requests += parseInt(r.request_count, 10) || 0
      if (r.model_used) cur.models.add(r.model_used)
      m.set(key, cur)
    }
    return m
  }, [rows])

  // A backend without the date grouping silently falls back to grouping by feature
  // (an empty key is a log row without a timestamp, not an old backend)
  const dateUnsupported = groupBy === 'date' && rows.some((r) => r.group_key != null && !isYmd(r.group_key))
  const undated = groupBy === 'date' ? merged.get('unknown') : null

  // Every day in the period, with zeros for days without calls, oldest first
  const days = useMemo(() => {
    if (groupBy !== 'date' || dateUnsupported) return []
    const keys = [...merged.keys()].filter(isYmd).sort()
    const first = start || keys[0]
    const last = end || keys[keys.length - 1]
    if (!first || !last) return []
    const out = []
    for (let d = first; d <= last && out.length < 1000; d = addDays(d, 1)) {
      out.push(merged.get(d) || { key: d, cost: 0, tokens: 0, input: 0, output: 0, requests: 0, models: new Set() })
    }
    return out
  }, [groupBy, dateUnsupported, merged, start, end])

  const byGroup = useMemo(
    () => [...merged.values()].map((g) => ({ key: g.key, label: groupBy === 'user' ? `User ${g.key}` : g.key, value: g.cost })).sort((a, b) => b.value - a.value),
    [merged, groupBy],
  )

  const metricFormat = metric === 'cost' ? (v) => usd(v) : num
  const avg = (parseFloat(totals.grand_total_cost) || 0) / (parseInt(totals.grand_total_requests, 10) || 1)
  const activeDays = days.filter((d) => d.requests > 0).length
  const busiest = days.reduce((best, d) => (d.cost > (best?.cost ?? -1) ? d : best), null)
  const periodText = start && end ? (start === end ? longDay(start) : `${longDay(start)} – ${longDay(end)}`) : 'All time'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">LLM usage</h1>
        <p className="mt-1 text-sm text-ink-2">{periodText} · days in IST</p>
      </div>

      <div className="glass flex flex-col gap-4 rounded-[1.5rem] p-4 sm:p-5">
        <Chips label="Period" options={RANGES} value={range} onChange={setRange} />
        {range === 'custom' && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              From
              <input type="date" value={from} max={today} onChange={(e) => setFrom(e.target.value)}
                className="mt-1 block rounded-xl border-line-2 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-ink-1 [color-scheme:dark] focus:border-gold focus:ring-gold" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              To
              <input type="date" value={to} max={today} onChange={(e) => setTo(e.target.value)}
                className="mt-1 block rounded-xl border-line-2 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-ink-1 [color-scheme:dark] focus:border-gold focus:ring-gold" />
            </label>
          </div>
        )}
        <Chips label="Group by" options={GROUPS} value={groupBy} onChange={setGroupBy} />
      </div>

      {error ? (
        <Panel><Failed error={error} onRetry={reload} /></Panel>
      ) : loading && !data ? (
        <Panel><Skeleton rows={6} /></Panel>
      ) : (
        <div className={cn('space-y-6 transition-opacity', loading && 'opacity-60')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tokens" value={num(totals.grand_total_tokens)} icon={Coins} />
            <Stat label="Cost" value={usd(totals.grand_total_cost, 2)} hint={usd(totals.grand_total_cost)} icon={CircleDollarSign} />
            <Stat label="Requests" value={num(totals.grand_total_requests)} icon={Server} />
            <Stat label="Avg cost / request" value={usd(avg)} icon={TrendingUp} />
          </div>

          {dateUnsupported ? (
            <Panel>
              <p className="flex items-start gap-2 text-sm text-gold-soft">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                The live backend doesn’t support grouping by day yet. Deploy the backend update (adminController.js) to Railway, then reload this page.
              </p>
              <p className="mt-2 text-xs text-ink-3">
                It grouped by: {[...new Set(rows.map((r) => String(r.group_key)))].slice(0, 5).join(', ')}
              </p>
            </Panel>
          ) : groupBy === 'date' ? (
            <>
              <Panel title="Per day" icon={CalendarDays}
                action={<Chips options={METRICS} value={metric} onChange={setMetric} />}>
                <ColumnChart rows={days.map((d) => ({ key: d.key, label: shortDay(d.key), value: d[metric] }))} format={metricFormat} />
                {undated && (
                  <p className="mt-4 text-sm text-gold-soft">
                    {num(undated.requests)} logged calls have no timestamp ({num(undated.tokens)} tokens, {usd(undated.cost)}), so they aren’t on any day. They are included in the totals above.
                  </p>
                )}
                {days.length > 0 && (
                  <p className="mt-4 text-sm text-ink-2">
                    {activeDays} of {days.length} days with LLM calls
                    {busiest?.cost > 0 && <> · busiest day {longDay(busiest.key)} ({usd(busiest.cost)}, {num(busiest.requests)} requests)</>}
                  </p>
                )}
              </Panel>

              <Panel title="Day by day" icon={Table}>
                {days.length === 0 ? (
                  <p className="text-sm text-ink-2">No LLM calls in this period.</p>
                ) : (
                  <div className="-mx-2 overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wider text-ink-3">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Day</th>
                          <th className="px-2 py-2 text-right font-semibold">Requests</th>
                          <th className="px-2 py-2 text-right font-semibold">Input</th>
                          <th className="px-2 py-2 text-right font-semibold">Output</th>
                          <th className="px-2 py-2 text-right font-semibold">Tokens</th>
                          <th className="px-2 py-2 text-right font-semibold">Cost</th>
                          <th className="px-2 py-2 font-semibold">Models</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 tabular-nums text-ink-2">
                        {[...days].reverse().filter((d) => d.requests > 0 || days.length <= 31).map((d) => (
                          <tr key={d.key} className={cn('hover:bg-white/5', d.requests === 0 && 'text-ink-3')}>
                            <td className="whitespace-nowrap px-2 py-2.5 text-ink-1">{longDay(d.key)}</td>
                            <td className="px-2 py-2.5 text-right">{num(d.requests)}</td>
                            <td className="px-2 py-2.5 text-right">{num(d.input)}</td>
                            <td className="px-2 py-2.5 text-right">{num(d.output)}</td>
                            <td className="px-2 py-2.5 text-right">{num(d.tokens)}</td>
                            <td className="px-2 py-2.5 text-right text-ink-1">{usd(d.cost)}</td>
                            <td className="max-w-[16rem] truncate px-2 py-2.5" title={[...d.models].join(', ')}>{[...d.models].join(', ') || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {days.length > 31 && <p className="px-2 pt-3 text-xs text-ink-3">Days without calls are hidden for periods longer than a month.</p>}
                  </div>
                )}
              </Panel>
            </>
          ) : (
            <>
              <Panel title={`Cost by ${groupLabel.toLowerCase()} (top 10)`} icon={ChartBar}>
                <BarList rows={byGroup.slice(0, 10)} format={(v) => usd(v)} empty="No LLM calls in this period." />
              </Panel>

              <Panel title="Breakdown" icon={Table}>
                {rows.length === 0 ? (
                  <p className="text-sm text-ink-2">No LLM calls in this period.</p>
                ) : (
                  <div className="-mx-2 overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wider text-ink-3">
                        <tr>
                          <th className="px-2 py-2 font-semibold">{groupLabel}</th>
                          <th className="px-2 py-2 font-semibold">Model</th>
                          <th className="px-2 py-2 text-right font-semibold">Requests</th>
                          <th className="px-2 py-2 text-right font-semibold">Input</th>
                          <th className="px-2 py-2 text-right font-semibold">Output</th>
                          <th className="px-2 py-2 text-right font-semibold">Avg tokens</th>
                          <th className="px-2 py-2 text-right font-semibold">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 tabular-nums text-ink-2">
                        {rows.map((r, i) => (
                          <tr key={`${r.group_key}-${r.model_used}-${i}`} className="hover:bg-white/5">
                            <td className="max-w-[16rem] truncate px-2 py-2.5 text-ink-1" title={String(r.group_key ?? 'unknown')}>
                              {groupBy === 'user' && r.group_key
                                ? <Link href={`/admin/users/${r.group_key}`} className="hover:text-gold-soft">User {r.group_key}</Link>
                                : String(r.group_key ?? 'unknown')}
                            </td>
                            <td className="px-2 py-2.5">{r.model_used || '—'}</td>
                            <td className="px-2 py-2.5 text-right">{num(r.request_count)}</td>
                            <td className="px-2 py-2.5 text-right">{num(r.total_input_tokens)}</td>
                            <td className="px-2 py-2.5 text-right">{num(r.total_output_tokens)}</td>
                            <td className="px-2 py-2.5 text-right">{num(Math.round(parseFloat(r.avg_tokens_per_request) || 0))}</td>
                            <td className="px-2 py-2.5 text-right text-ink-1">{usd(r.total_cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </>
          )}

          {pricing && (
            <Panel title="Rates used for cost" icon={Tag}>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-ink-2">Model</dt><dd className="mt-1 font-semibold text-ink-1">{pricing.model}</dd></div>
                <div><dt className="text-ink-2">Input per 1K tokens</dt><dd className="mt-1 font-semibold tabular-nums text-ink-1">{pricing.input_per_1k_tokens} {pricing.currency}</dd></div>
                <div><dt className="text-ink-2">Output per 1K tokens</dt><dd className="mt-1 font-semibold tabular-nums text-ink-1">{pricing.output_per_1k_tokens} {pricing.currency}</dd></div>
              </dl>
            </Panel>
          )}
        </div>
      )}
    </div>
  )
}
