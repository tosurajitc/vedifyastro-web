'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Download, FileText, Loader2, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import { refreshBalance } from '@/lib/walletEvents'

// Advanced Kundli PDF: ₹99 from the wallet (kundliController.generateAdvancedKundliPDF).
// Generation runs ~15 AI sections on the engine and takes 2–3 minutes.
const PRICE = 99
const INCLUDES = ['Birth chart with all planets and houses', 'Personality, career, wealth and relationships', 'Dasha periods and what they bring', 'Yogas and doshas in your chart', 'Remedies matched to your planets', 'Written for you in your language']
const STAGES = ['Reading your chart', 'Writing personality and career', 'Writing wealth and relationships', 'Mapping your dashas', 'Choosing your remedies', 'Laying out the PDF']

export default function KundliPdf({ name }) {
  const [status, setStatus] = useState({ loading: true, purchased: false, url: null })
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState('')
  const [lowBalance, setLowBalance] = useState(false)
  const [download, setDownload] = useState(null) // object URL of a freshly generated PDF
  const timer = useRef(null)

  const check = useCallback(async () => {
    try {
      const res = await api('/kundli/purchase-status')
      setStatus({ loading: false, purchased: !!res.data?.purchased, url: res.data?.pdf_url || null })
    } catch {
      setStatus({ loading: false, purchased: false, url: null })
    }
  }, [])
  useEffect(() => { check(); return () => clearInterval(timer.current) }, [check])

  async function buy() {
    setError('')
    setLowBalance(false)
    setBusy(true)
    setStage(0)
    timer.current = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 25_000)
    try {
      const res = await fetch('/api/kundli/advanced-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const type = res.headers.get('content-type') || ''
      if (res.ok && type.includes('application/pdf')) {
        const blob = await res.blob()
        setDownload(URL.createObjectURL(blob))
        setStatus((s) => ({ ...s, purchased: true, url: res.headers.get('x-pdf-url') || s.url }))
        refreshBalance()
        return
      }
      const data = await res.json().catch(() => null)
      if (res.ok && data?.data?.already_purchased) {
        setStatus({ loading: false, purchased: true, url: data.data.pdf_url })
        return
      }
      const message = data?.error?.message || data?.message || 'Could not create your report. You have not been charged.'
      if (data?.error?.code === 402 || /insufficient/i.test(message)) setLowBalance(true)
      setError(message)
    } catch {
      setError('The connection dropped while your report was being made. If you were charged, it will appear here shortly — refresh this tab.')
    } finally {
      clearInterval(timer.current)
      setBusy(false)
    }
  }

  const fileName = `VedifyAstro_Kundli_${(name || 'report').replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`

  if (status.loading) return <div className="glass h-64 animate-pulse rounded-[2rem]" />

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600/50 via-cosmos-800/70 to-cosmos-900 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gold-grad text-cosmos-950"><FileText size={28} /></span>
        <h2 className="relative mt-4 font-display text-3xl font-black tracking-tight">Advanced Kundli report</h2>
        <p className="relative mt-2 text-ink-2">A detailed, personalised PDF of your chart — yours to keep and download any time.</p>
        <ul className="relative mt-5 grid gap-2 sm:grid-cols-2">
          {INCLUDES.map((x) => <li key={x} className="flex items-start gap-2 text-sm text-ink-1"><Check size={16} className="mt-0.5 shrink-0 text-gold" /> {x}</li>)}
        </ul>
      </div>

      <div className="glass h-fit rounded-[2rem] p-6">
        {download || (status.purchased && status.url) ? (
          <>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300"><Check size={16} /> Your report is ready</p>
            <a href={download || status.url} download={download ? fileName : undefined} target={download ? undefined : '_blank'} rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
              <Download size={18} /> Download PDF
            </a>
            <p className="mt-3 text-xs text-ink-3">Already paid for — come back to download it again whenever you like.</p>
          </>
        ) : busy ? (
          <div>
            <p className="inline-flex items-center gap-2 font-bold"><Loader2 size={18} className="animate-spin text-gold" /> Writing your report…</p>
            <p className="mt-1 text-sm text-ink-2">This takes 2–3 minutes. Please keep this tab open.</p>
            <ol className="mt-5 space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s} className={i <= stage ? 'text-ink-1' : 'text-ink-3'}>
                  <span className="inline-flex items-center gap-2 text-sm">
                    {i < stage ? <Check size={15} className="text-emerald-300" /> : i === stage ? <motion.span className="h-2.5 w-2.5 rounded-full bg-gold" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} /> : <span className="h-2.5 w-2.5 rounded-full bg-white/15" />}
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink-2">One-time price</p>
            <p className="font-display text-4xl font-black">₹{PRICE}</p>
            <p className="mt-1 text-xs text-ink-3">Paid from your VA Points wallet</p>
            <button type="button" onClick={buy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
              <FileText size={18} /> {status.purchased ? 'Re-create my report' : `Get my report · ₹${PRICE}`}
            </button>
            {error && <p role="alert" className="mt-3 rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            {lowBalance && (
              <Link href="/wallet?next=/kundli" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-3 text-sm font-semibold text-gold-soft hover:bg-gold hover:text-cosmos-950">
                <Wallet size={16} /> Recharge wallet
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}
