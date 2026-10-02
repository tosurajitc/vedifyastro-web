'use client'

import { Mail } from 'lucide-react'
import { LANGUAGES, MARITAL, UNKNOWN_BIRTH_TIME, isValidEmail } from '@/lib/onboarding'
import { cn } from '@/lib/cn'
import { NextButton, inputClass } from './ui'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-ink-3">{label}</span>
      <span className="text-right font-semibold text-ink-1">{value}</span>
    </div>
  )
}

const formatDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

export default function StepPreferences({ data, update, onSubmit, saving, setError }) {
  function submit(e) {
    e.preventDefault()
    if (!data.preferred_language) return setError('Please choose the language you want to talk in.')
    if (!isValidEmail(data.email)) return setError('Please enter a valid email address.')
    onSubmit()
  }

  return (
    <form onSubmit={submit}>
      <h2 className="font-display text-2xl font-black tracking-tight">Your language</h2>
      <p className="mt-1 text-sm text-ink-2">Your guides and every report will speak this language. You can change it later.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Preferred language">
        {LANGUAGES.map((l) => (
          <button
            key={l.name}
            type="button"
            role="radio"
            aria-checked={data.preferred_language === l.name}
            onClick={() => update({ preferred_language: l.name })}
            className={cn('rounded-2xl border px-3 py-3 text-left transition',
              data.preferred_language === l.name ? 'border-gold bg-gold/15' : 'border-line-2 bg-white/5 hover:border-gold/40')}
          >
            <span className={cn('block text-base font-bold', data.preferred_language === l.name ? 'text-gold-soft' : 'text-ink-1')}>{l.native}</span>
            <span className="block text-xs text-ink-3">{l.name}</span>
          </button>
        ))}
      </div>

      <label htmlFor="email" className="mt-6 block text-sm font-semibold text-ink-2">Email</label>
      <div className="relative">
        <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gold" />
        <input id="email" type="email" autoComplete="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" className={cn(inputClass, 'pl-11')} />
      </div>
      <p className="mt-2 text-xs text-ink-3">For receipts and your reports. We never share it.</p>

      <div className="mt-6 rounded-2xl bg-white/5 px-4 py-2">
        <Row label="Name" value={data.name} />
        <Row label="Born" value={formatDate(data.birth_date)} />
        <Row label="Time" value={data.timeUnknown ? `Unknown (using ${UNKNOWN_BIRTH_TIME})` : data.birth_time} />
        <Row label="Place" value={data.place?.label || data.placeText} />
        <Row label="Marital status" value={MARITAL.find((m) => m.value === data.marital_status)?.label} />
      </div>

      <NextButton type="submit" busy={saving}>{saving ? 'Casting your chart…' : 'Meet your guide'}</NextButton>
    </form>
  )
}
