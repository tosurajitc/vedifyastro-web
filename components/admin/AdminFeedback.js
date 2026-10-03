'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Bot, Check, FileText, Loader2, RefreshCw, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { Chips, Failed, Panel, Skeleton, day, num, useAdminData } from './ui'

const PERIODS = [{ value: 7, label: '7 days' }, { value: 14, label: '14 days' }, { value: 30, label: '30 days' }]
const titleCase = (t) => String(t || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// Same bands as the app: at or over the review threshold is critical, half of it is a warning
function band(rate, threshold) {
  if (rate >= threshold) return { bar: 'bg-rose', text: 'text-rose', label: 'Needs review' }
  if (rate >= threshold / 2) return { bar: 'bg-gold', text: 'text-gold', label: 'Watch' }
  return { bar: 'bg-aqua', text: 'text-aqua', label: 'Healthy' }
}

function PromptReview({ prompt, onClose, onDone }) {
  const [suggested, setSuggested] = useState(null)
  const [current, setCurrent] = useState(undefined) // undefined = loading, null = none active
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    const type = encodeURIComponent(prompt.specialist_type)
    api(`/specialist-feedback/admin/prompts/${type}/${prompt.id}`).then((r) => setSuggested(r.data)).catch((e) => setError(e.message))
    // The live prompt, to compare against
    api(`/specialist-feedback/admin/prompts/${type}`)
      .then(async (r) => {
        const live = (r.data || []).find((v) => v.is_active)
        if (!live) return setCurrent(null)
        const d = await api(`/specialist-feedback/admin/prompts/${type}/${live.id}`)
        setCurrent(d.data)
      })
      .catch(() => setCurrent(null))
  }, [prompt])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  async function act(kind) {
    setBusy(kind)
    setError('')
    try {
      const res = await api(`/specialist-feedback/admin/prompts/${prompt.id}/${kind}`, { method: 'POST' })
      onDone(res.message || (kind === 'approve' ? 'Prompt approved.' : 'Prompt rejected.'))
    } catch (e) {
      setError(e.message)
      setBusy(null)
      setConfirm(null)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-cosmos-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="prompt-title"
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] border border-line-2 bg-cosmos-800 shadow-glow sm:rounded-[1.75rem]">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5 sm:p-6">
          <div>
            <h2 id="prompt-title" className="font-display text-xl font-black">{titleCase(prompt.specialist_type)} · v{prompt.version}</h2>
            <p className="mt-1 text-sm text-ink-2">Suggested {day(prompt.suggested_at)} after a high thumbs-down rate. Approving makes it live for this specialist.</p>
          </div>
          <button type="button" onClick={onClose} disabled={!!busy} className="rounded-full p-2 text-ink-2 hover:bg-white/10 hover:text-ink-1" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-5 sm:p-6 lg:grid-cols-2">
          {[['Current (live)', current], ['Suggested', suggested]].map(([label, p]) => (
            <div key={label} className="flex min-h-0 flex-col">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold">{label}{p?.version ? ` · v${p.version}` : ''}</p>
              <pre className="max-h-[50vh] flex-1 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-cosmos-950/50 p-4 font-sans text-sm leading-relaxed text-ink-1">
                {p?.prompt_text
                  ?? (label === 'Suggested'
                    ? (error ? 'Could not load this suggestion.' : 'Loading…')
                    : p === undefined ? 'Loading…' : 'No live prompt; the specialist uses its built-in default.')}
              </pre>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/5 p-5 sm:p-6">
          {error && <p role="alert" className="mr-auto text-sm text-rose">{error}</p>}
          {confirm ? (
            <>
              <span className="text-sm text-ink-1">{confirm === 'approve' ? 'Make this prompt live?' : 'Reject this suggestion?'}</span>
              <button type="button" onClick={() => setConfirm(null)} disabled={!!busy} className="rounded-full border border-line-2 px-4 py-2 text-sm font-semibold text-ink-1 hover:bg-white/5">Cancel</button>
              <button type="button" onClick={() => act(confirm)} disabled={!!busy}
                className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60', confirm === 'approve' ? 'bg-aqua text-cosmos-950' : 'bg-rose text-white')}>
                {busy && <Loader2 size={15} className="animate-spin" />} Yes, {confirm}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setConfirm('reject')} disabled={!suggested}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose/50 px-4 py-2 text-sm font-bold text-rose hover:bg-rose/10 disabled:opacity-40"><X size={15} /> Reject</button>
              <button type="button" onClick={() => setConfirm('approve')} disabled={!suggested}
                className="inline-flex items-center gap-1.5 rounded-full bg-aqua px-4 py-2 text-sm font-bold text-cosmos-950 hover:brightness-110 disabled:opacity-40"><Check size={15} /> Approve</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminFeedback() {
  const [days, setDays] = useState(7)
  const { data, loading, error, reload } = useAdminData(`/specialist-feedback/admin/report?days=${days}`)
  const [open, setOpen] = useState(null)
  const [aggregating, setAggregating] = useState(false)
  const [notice, setNotice] = useState(null)

  const report = data?.report || []
  const pending = data?.pendingPrompts || []
  const threshold = parseFloat(data?.threshold) || 30

  async function aggregate() {
    setAggregating(true)
    setNotice(null)
    try {
      const res = await api('/specialist-feedback/admin/aggregate', { method: 'POST' })
      setNotice({ ok: true, text: res.message || 'Aggregation finished.' })
      await reload()
    } catch (e) {
      setNotice({ ok: false, text: e.message })
    } finally {
      setAggregating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">AI feedback</h1>
        <button type="button" onClick={aggregate} disabled={aggregating}
          className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-soft hover:bg-gold/20 disabled:opacity-60"
          title="Recount today's thumbs up/down and suggest new prompts for specialists over the threshold">
          <RefreshCw size={15} className={cn(aggregating && 'animate-spin')} /> Run aggregation now
        </button>
      </div>
      {notice && <p role="status" className={cn('text-sm', notice.ok ? 'text-aqua' : 'text-rose')}>{notice.text}</p>}

      <Chips label="Period" options={PERIODS} value={days} onChange={setDays} />

      {error ? (
        <Panel><Failed error={error} onRetry={reload} /></Panel>
      ) : loading && !data ? (
        <Panel><Skeleton rows={6} /></Panel>
      ) : (
        <div className={cn('space-y-6 transition-opacity', loading && 'opacity-60')}>
          <Panel title={`Prompt suggestions to review (${pending.length})`} icon={FileText}>
            {pending.length === 0 ? (
              <p className="text-sm text-ink-2">Nothing waiting. Suggestions appear when a specialist’s thumbs-down rate passes {threshold}%.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => setOpen(p)} className="w-full rounded-2xl border border-gold/30 bg-gold/5 p-4 text-left transition hover:border-gold/60 hover:bg-gold/10">
                      <span className="flex items-center gap-2 font-semibold text-ink-1"><AlertTriangle size={15} className="text-gold" /> {titleCase(p.specialist_type)}</span>
                      <span className="mt-1 block text-xs text-ink-2">v{p.version} · suggested {day(p.suggested_at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Thumbs-down rate by specialist" icon={Bot} action={<span className="text-xs text-ink-3">Review threshold {threshold}%</span>}>
            {report.length === 0 ? (
              <p className="text-sm text-ink-2">No feedback in the last {days} days.</p>
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-ink-3">
                    <tr>
                      <th className="px-2 py-2 font-semibold">Specialist</th>
                      <th className="w-[38%] px-2 py-2 font-semibold">Avg. thumbs-down rate</th>
                      <th className="px-2 py-2 text-right font-semibold"><span className="sr-only">Thumbs up</span><ThumbsUp size={14} className="ml-auto" aria-hidden="true" /></th>
                      <th className="px-2 py-2 text-right font-semibold"><span className="sr-only">Thumbs down</span><ThumbsDown size={14} className="ml-auto" aria-hidden="true" /></th>
                      <th className="px-2 py-2 text-right font-semibold">Rated</th>
                      <th className="px-2 py-2 text-right font-semibold">Days flagged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 tabular-nums text-ink-2">
                    {report.map((r) => {
                      const rate = parseFloat(r.avg_negative_rate) || 0
                      const b = band(rate, threshold)
                      return (
                        <tr key={r.specialist_type} className="hover:bg-white/5">
                          <td className="px-2 py-3 font-semibold text-ink-1">{titleCase(r.specialist_type)}</td>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-3" title={`${rate.toFixed(1)}% · ${b.label}`}>
                              <span className="h-2 flex-1 rounded-full bg-white/5">
                                <span className={cn('block h-full rounded-full', b.bar)} style={{ width: `${Math.min(rate, 100)}%` }} />
                              </span>
                              <span className="w-24 shrink-0 text-right"><span className="text-ink-1">{rate.toFixed(1)}%</span> <span className={cn('text-xs', b.text)}>{b.label}</span></span>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-right">{num(r.total_thumbs_up)}</td>
                          <td className="px-2 py-3 text-right">{num(r.total_thumbs_down)}</td>
                          <td className="px-2 py-3 text-right">{num(r.total_messages)}</td>
                          <td className="px-2 py-3 text-right">{num(r.days_flagged)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <PromptReview key={open.id} prompt={open} onClose={() => setOpen(null)}
            onDone={(text) => { setOpen(null); setNotice({ ok: true, text }); reload() }} />
        )}
      </AnimatePresence>
    </div>
  )
}
