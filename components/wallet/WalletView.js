'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Gift, Loader2, ShieldCheck, Sparkles, Wallet, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { emitBalance } from '@/lib/walletEvents'
import { PaymentCancelled, recharge } from '@/lib/razorpay'
import { MAX_RECHARGE, MIN_RECHARGE, PACK_AMOUNTS, PRICES, calculateVAPoints, nextBonusTier } from '@/lib/pricing'
import { cn } from '@/lib/cn'
import CountUp from './CountUp'
import SuccessBurst from './SuccessBurst'

const PAGE = 20
const pts = (n) => Math.floor(Number(n) || 0).toLocaleString('en-IN')
const when = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function PackCard({ rupees, selected, onSelect }) {
  const { vaPoints, bonusPoints, bonusPercent } = calculateVAPoints(rupees)
  const top = rupees === PACK_AMOUNTS[PACK_AMOUNTS.length - 1]
  return (
    <motion.button type="button" onClick={onSelect} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} aria-pressed={selected}
      className={cn('relative overflow-hidden rounded-3xl border p-4 text-left transition',
        selected ? 'border-gold bg-gold/15 shadow-glow-gold' : 'border-line-2 bg-white/5 hover:border-gold/50')}>
      {bonusPercent > 0 && (
        <span className={cn('absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide',
          top ? 'bg-gold-grad text-cosmos-950' : 'bg-emerald-400/15 text-emerald-300')}>
          {top ? 'Highest bonus' : `+${bonusPercent}%`}
        </span>
      )}
      <p className="text-sm font-semibold text-ink-2">₹{rupees.toLocaleString('en-IN')}</p>
      <p className="mt-2 font-display text-2xl font-black text-ink-1">{pts(vaPoints)}</p>
      <p className="text-xs text-ink-3">VA Points</p>
      <p className={cn('mt-2 text-xs font-semibold', bonusPoints ? 'text-emerald-300' : 'text-ink-3')}>
        {bonusPoints ? `+${pts(bonusPoints)} bonus` : `${Math.floor(vaPoints / PRICES.chatPerMinute)} min of chat`}
      </p>
    </motion.button>
  )
}

function TxnRow({ t }) {
  const credit = t.transactionType === 'credit'
  return (
    <li className="flex items-center gap-3 border-b border-line py-3.5 last:border-0">
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', credit ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-ink-2')}>
        {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-1">{t.description || (credit ? 'Wallet recharge' : 'Service payment')}</p>
        <p className="text-xs text-ink-3">{when(t.createdAt)} · balance {pts(t.balanceAfter)}</p>
      </div>
      <span className={cn('shrink-0 font-bold tabular-nums', credit ? 'text-emerald-300' : 'text-ink-1')}>
        {credit ? '+' : '−'}{pts(t.amount)}
      </span>
    </li>
  )
}

export default function WalletView({ payer, guide, next }) {
  const [balance, setBalance] = useState(null)
  const [summary, setSummary] = useState(null)
  const [txns, setTxns] = useState([])
  const [total, setTotal] = useState(0)
  const [loadingTxns, setLoadingTxns] = useState(true)
  const [filter, setFilter] = useState('all')

  const [amount, setAmount] = useState(100)
  const [custom, setCustom] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const loadBalance = useCallback(async () => {
    try {
      const b = await api('/wallet/balance')
      setBalance(b.data.balance)
      emitBalance(b.data.balance)
    } catch {}
  }, [])

  const loadTxns = useCallback(async (offset = 0) => {
    setLoadingTxns(true)
    try {
      const r = await api(`/wallet/transactions?limit=${PAGE}&offset=${offset}`)
      setTxns((prev) => (offset ? [...prev, ...r.data.transactions] : r.data.transactions))
      setSummary(r.data.summary)
      setTotal(r.data.pagination.total)
    } catch {} finally {
      setLoadingTxns(false)
    }
  }, [])

  useEffect(() => { loadBalance(); loadTxns(0) }, [loadBalance, loadTxns])

  const rupees = custom ? Number(custom) : amount
  const valid = Number.isInteger(rupees) && rupees >= MIN_RECHARGE && rupees <= MAX_RECHARGE
  const preview = calculateVAPoints(valid ? rupees : 0)
  const hint = valid ? nextBonusTier(rupees) : null

  async function pay() {
    if (!valid) return setError(`Enter a whole amount between ₹${MIN_RECHARGE} and ₹${MAX_RECHARGE.toLocaleString('en-IN')}.`)
    setError('')
    setPaying(true)
    try {
      const result = await recharge(rupees, { ...payer, description: `Wallet recharge · ${pts(preview.vaPoints)} VA Points` })
      setSuccess(result)
      setBalance(result.newBalance)
      emitBalance(result.newBalance)
      loadTxns(0)
    } catch (e) {
      if (!(e instanceof PaymentCancelled)) setError(e.message)
    } finally {
      setPaying(false)
    }
  }

  const shown = txns.filter((t) => filter === 'all' || (filter === 'credit' ? t.transactionType === 'credit' : t.transactionType !== 'credit'))

  return (
    <section className="py-10 sm:py-16">
      <div className="wrap max-w-5xl">
        {/* Balance */}
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600/60 via-cosmos-800/80 to-cosmos-900 p-6 sm:p-10">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-cosmos-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gold"><Wallet size={16} /> Cosmic Wallet</p>
              <p className="mt-3 font-display text-6xl font-black tracking-tight sm:text-7xl">
                {balance == null ? <span className="text-ink-3">—</span> : <span className="text-gold-grad"><CountUp value={balance} /></span>}
              </p>
              <p className="mt-1 text-ink-2">VA Points · 1 point = ₹1</p>
              {balance != null && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-ink-1">
                  <Zap size={14} className="text-gold" /> About <b>{Math.floor(balance / PRICES.chatPerMinute)}</b> minutes with {guide.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-72">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-ink-3">Total added</p>
                <p className="mt-1 text-lg font-bold text-emerald-300">{summary ? pts(summary.totalTopup) : '—'}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-ink-3">Total spent</p>
                <p className="mt-1 text-lg font-bold text-ink-1">{summary ? pts(summary.totalDebited) : '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr,360px]">
          {/* Recharge */}
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">Add VA Points</h2>
            <p className="mt-1 text-sm text-ink-2">Bigger recharges earn up to 30% bonus points.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PACK_AMOUNTS.map((r) => (
                <PackCard key={r} rupees={r} selected={!custom && amount === r} onSelect={() => { setAmount(r); setCustom(''); setError('') }} />
              ))}
              <label className={cn('flex flex-col justify-center rounded-3xl border p-4 transition', custom ? 'border-gold bg-gold/15' : 'border-dashed border-line-2 bg-white/5')}>
                <span className="text-sm font-semibold text-ink-2">Other amount</span>
                <span className="mt-2 flex items-center gap-1 text-2xl font-black">
                  ₹<input type="number" inputMode="numeric" min={MIN_RECHARGE} max={MAX_RECHARGE} placeholder="250" value={custom}
                    onChange={(e) => { setCustom(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    className="w-full border-0 bg-transparent p-0 text-2xl font-black text-ink-1 placeholder:text-ink-3 focus:ring-0" />
                </span>
                <span className="text-xs text-ink-3">₹{MIN_RECHARGE} – ₹1,00,000</span>
              </label>
            </div>
          </div>

          {/* Summary + pay */}
          <aside className="glass h-fit rounded-[2rem] p-6 lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-ink-2">You pay</p>
            <p className="font-display text-4xl font-black">₹{valid ? rupees.toLocaleString('en-IN') : '—'}</p>
            <div className="mt-4 space-y-2 rounded-2xl bg-white/5 p-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-2">VA Points</span><span className="font-semibold">{pts(valid ? rupees : 0)}</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Bonus{preview.bonusPercent ? ` (${preview.bonusPercent}%)` : ''}</span><span className="font-semibold text-emerald-300">+{pts(preview.bonusPoints)}</span></div>
              <div className="flex justify-between border-t border-line pt-2"><span className="font-semibold">You get</span><span className="font-black text-gold-soft">{pts(preview.vaPoints)}</span></div>
            </div>
            {hint && (
              <p className="mt-3 flex items-start gap-2 text-xs text-ink-2">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-gold" /> Add ₹{hint.needed.toLocaleString('en-IN')} more to get +{hint.percent}% bonus.
              </p>
            )}
            <button type="button" onClick={pay} disabled={paying || !valid}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-4 text-lg font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none">
              {paying ? <Loader2 size={20} className="animate-spin" /> : null} {paying ? 'Opening payment…' : `Pay ₹${valid ? rupees.toLocaleString('en-IN') : ''}`}
            </button>
            {error && <p role="alert" className="mt-3 rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-3"><ShieldCheck size={13} className="text-gold" /> Secure payment by Razorpay · UPI, cards, net banking</p>
          </aside>
        </div>

        {/* Refer */}
        <Link href="/wallet/refer" className="group mt-10 flex items-center gap-4 rounded-[2rem] border border-gold/25 bg-gold/5 p-5 transition hover:border-gold/60 sm:p-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-grad text-cosmos-950"><Gift size={26} /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Refer friends, earn 100 VA Points each</p>
            <p className="text-sm text-ink-2">Plus 10% of what they spend in months over ₹2,000.</p>
          </div>
          <span className="hidden text-sm font-semibold text-gold-soft transition group-hover:translate-x-1 sm:inline">Invite →</span>
        </Link>

        {/* History */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-black tracking-tight">History</h2>
            <div className="flex rounded-full border border-line-2 p-1 text-sm font-semibold" role="tablist">
              {[['all', 'All'], ['credit', 'Added'], ['debit', 'Spent']].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}
                  className={cn('rounded-full px-4 py-1.5 transition', filter === id ? 'bg-gold text-cosmos-950' : 'text-ink-2 hover:text-ink-1')}>{label}</button>
              ))}
            </div>
          </div>
          <div className="glass mt-4 rounded-[2rem] px-5 py-2 sm:px-6">
            {shown.length > 0 ? (
              <ul>{shown.map((t) => <TxnRow key={t.id} t={t} />)}</ul>
            ) : (
              <p className="py-10 text-center text-sm text-ink-3">{loadingTxns ? 'Loading…' : 'No transactions yet. Your first recharge will show here.'}</p>
            )}
            {txns.length < total && (
              <button type="button" onClick={() => loadTxns(txns.length)} disabled={loadingTxns} className="my-3 w-full rounded-full border border-line-2 py-2.5 text-sm font-semibold text-ink-2 hover:text-ink-1">
                {loadingTxns ? 'Loading…' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>

      <SuccessBurst result={success} guide={guide} next={next} onClose={() => setSuccess(null)} />
    </section>
  )
}
