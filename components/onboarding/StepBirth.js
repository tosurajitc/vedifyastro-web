'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Moon, Sun, Sunrise, Sunset } from 'lucide-react'
import { api } from '@/lib/api'
import { partOfDay, searchPlaces } from '@/lib/onboarding'
import { cn } from '@/lib/cn'
import { NextButton, inputClass } from './ui'

const DAY_ICON = { Morning: Sunrise, Afternoon: Sun, Evening: Sunset, Night: Moon }

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function StepBirth({ data, update, onNext, setError }) {
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [verifying, setVerifying] = useState(false)
  const abortRef = useRef(null)

  // Debounced OpenStreetMap search as the user types
  useEffect(() => {
    const q = data.placeText.trim()
    if (data.place?.label === data.placeText || q.length < 3) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setSearching(true)
      try {
        const rows = await searchPlaces(q, { india: data.india, signal: ctrl.signal })
        setSuggestions(rows)
        setActive(-1)
        setOpen(true)
      } catch {
        // aborted or offline; the typed text can still be verified on Continue
      } finally {
        if (abortRef.current === ctrl) setSearching(false)
      }
    }, 450)
    return () => clearTimeout(t)
  }, [data.placeText, data.india, data.place])

  function pick(p) {
    update({ place: p, placeText: p.label })
    setOpen(false)
  }

  async function next(e) {
    e.preventDefault()
    const year = parseInt(data.birth_date.slice(0, 4), 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birth_date) || year < 1900 || data.birth_date > todayIso()) return setError('Please enter a valid birth date.')
    if (!data.timeUnknown && !/^\d{2}:\d{2}$/.test(data.birth_time)) return setError('Please enter your birth time, or tick "I don\'t know".')
    const birthPlace = data.place?.label || data.placeText.trim()
    if (birthPlace.length < 3) return setError('Please enter the city you were born in.')

    // The backend geocodes the place; the coordinates go into the chart calculation
    setError('')
    setVerifying(true)
    try {
      const res = await api('/birth-details/verify-location', { method: 'POST', body: { location: data.india && !/india/i.test(birthPlace) ? `${birthPlace}, India` : birthPlace } })
      update({ latitude: res.data.latitude, longitude: res.data.longitude })
      onNext()
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  const dayPart = !data.timeUnknown && partOfDay(data.birth_time)
  const DayIcon = dayPart ? DAY_ICON[dayPart] : null

  return (
    <form onSubmit={next}>
      <h2 className="font-display text-2xl font-black tracking-tight">When and where were you born?</h2>
      <p className="mt-1 text-sm text-ink-2">Use the time from your birth certificate if you have it — a few minutes can change your ascendant.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="dob" className="block text-sm font-semibold text-ink-2">Date of birth</label>
          <input id="dob" type="date" min="1900-01-01" max={todayIso()} value={data.birth_date} onChange={(e) => update({ birth_date: e.target.value })} className={inputClass} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="tob" className="block text-sm font-semibold text-ink-2">Time of birth</label>
            {DayIcon && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-soft"><DayIcon size={13} /> {dayPart}</span>
            )}
          </div>
          <input id="tob" type="time" disabled={data.timeUnknown} value={data.birth_time} onChange={(e) => update({ birth_time: e.target.value })} className={cn(inputClass, 'disabled:opacity-40')} />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={data.timeUnknown} onChange={(e) => update({ timeUnknown: e.target.checked })} className="rounded border-line-2 bg-white/5 text-gold focus:ring-gold/30" />
            I don&apos;t know my birth time
          </label>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="pob" className="block text-sm font-semibold text-ink-2">Place of birth</label>
          <div className="flex rounded-full border border-line-2 p-0.5 text-xs font-semibold" role="group" aria-label="Born in">
            {[{ v: true, l: 'India' }, { v: false, l: 'Outside India' }].map((o) => (
              <button key={o.l} type="button" aria-pressed={data.india === o.v} onClick={() => update({ india: o.v, place: null })}
                className={cn('rounded-full px-3 py-1 transition', data.india === o.v ? 'bg-gold text-cosmos-950' : 'text-ink-2 hover:text-ink-1')}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gold" />
          <input
            id="pob"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="pob-list"
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={data.india ? 'Start typing your city, e.g. Kolkata' : 'City, e.g. London'}
            value={data.placeText}
            onChange={(e) => update({ placeText: e.target.value, place: null })}
            onFocus={() => suggestions.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (!open || !suggestions.length) return
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % suggestions.length) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1)) }
              if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(suggestions[active]) }
              if (e.key === 'Escape') setOpen(false)
            }}
            className={cn(inputClass, 'pl-11 pr-10')}
          />
          {searching && <Loader2 size={16} className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 animate-spin text-ink-3" />}
          {open && suggestions.length > 0 && (
            <ul id="pob-list" role="listbox" className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-line-2 bg-cosmos-800 shadow-glow">
              {suggestions.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)}
                    className={cn('flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition', i === active ? 'bg-white/10' : 'hover:bg-white/5')}>
                    <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                    <span><span className="font-semibold text-ink-1">{p.city}</span><span className="text-ink-2">{[p.state, p.country].filter(Boolean).length ? `, ${[p.state, p.country].filter(Boolean).join(', ')}` : ''}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-3">Place search by OpenStreetMap. If your town isn&apos;t listed, type “Town, District, State”.</p>
      </div>

      <NextButton type="submit" busy={verifying}>{verifying ? 'Finding your birthplace…' : 'Continue'}</NextButton>
    </form>
  )
}
