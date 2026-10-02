'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { GUIDES } from '@/lib/guides'
import { getReferral, clearReferral } from '@/lib/referral'
import { UNKNOWN_BIRTH_TIME } from '@/lib/onboarding'
import { cn } from '@/lib/cn'
import StepIdentity from './StepIdentity'
import StepBirth from './StepBirth'
import StepPreferences from './StepPreferences'

const STEPS = [
  { label: 'About you', say: (name) => `Namaste${name ? ` ${name.split(' ')[0]}` : ''}! Tell me a little about yourself.` },
  { label: 'Birth details', say: () => 'The exact moment and place you were born let me cast your kundli precisely.' },
  { label: 'Language', say: () => 'Last step — which language shall we talk in?' },
]

// Shown before a gender is picked; afterwards the guide who will actually greet the user
function GuideBubble({ gender, text }) {
  const guide = gender === 'male' ? GUIDES.savitri : gender ? GUIDES.satyaban : null
  return (
    <div className="flex items-start gap-4">
      <div className="relative shrink-0">
        <div className="rounded-full bg-gold-grad p-0.5 shadow-glow-gold">
          <div className="relative h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20">
            <AnimatePresence mode="wait">
              <motion.div key={guide?.key || 'pair'} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                {guide ? (
                  <Image src={guide.avatar} alt={guide.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full">
                    <div className="relative w-1/2 overflow-hidden"><Image src={GUIDES.savitri.avatar} alt="" fill sizes="80px" className="object-cover" /></div>
                    <div className="relative w-1/2 overflow-hidden"><Image src={GUIDES.satyaban.avatar} alt="" fill sizes="80px" className="object-cover" /></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">{guide ? `${guide.name} · your guide` : 'Savitri & Satyaban'}</p>
        <AnimatePresence mode="wait">
          <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-1.5 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-ink-1">
            {text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function OnboardingFlow({ next, initialName, initialEmail }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    name: initialName,
    gender: '',
    marital_status: '',
    birth_date: '',
    birth_time: '',
    timeUnknown: false,
    india: true,
    place: null, // { city, state, country, label } once picked
    placeText: '',
    latitude: null,
    longitude: null,
    preferred_language: '',
    email: initialEmail,
  })
  const update = (fields) => setData((d) => ({ ...d, ...fields }))

  const go = (to) => {
    setError('')
    setDir(to > step ? 1 : -1)
    setStep(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    setError('')
    setSaving(true)
    try {
      await api('/birth-details', {
        method: 'PUT',
        body: {
          name: data.name.trim(),
          birth_date: data.birth_date,
          birth_time: data.timeUnknown ? UNKNOWN_BIRTH_TIME : data.birth_time,
          birth_place: data.place?.label || data.placeText.trim(),
          gender: data.gender,
          marital_status: data.marital_status,
          latitude: data.latitude,
          longitude: data.longitude,
          email: data.email.trim(),
          social_handles: null,
          preferred_language: data.preferred_language,
          referred_by: getReferral(),
        },
      })
      clearReferral()
      router.replace(next)
      router.refresh()
    } catch (e) {
      // The email belongs to another account with the same birth details; the backend emails that account a code
      setError(e.data?.requiresEmailVerification
        ? `${e.message} If this isn't you, use a different email.`
        : e.message)
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex flex-1 items-center gap-2">
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition',
              i < step ? 'bg-gold text-cosmos-950' : i === step ? 'bg-gold-grad text-cosmos-950 shadow-glow-gold' : 'border border-line-2 text-ink-3')}>
              {i < step ? <Check size={15} /> : i + 1}
            </span>
            <span className={cn('hidden text-sm font-semibold sm:inline', i <= step ? 'text-ink-1' : 'text-ink-3')}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <span className="relative h-0.5 flex-1 overflow-hidden rounded bg-line-2">
                <motion.span className="absolute inset-y-0 left-0 bg-gold" animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
              </span>
            )}
          </li>
        ))}
      </ol>

      <GuideBubble gender={data.gender} text={STEPS[step].say(data.name)} />

      <div className="glass mt-6 overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && <StepIdentity data={data} update={update} onNext={() => go(1)} setError={setError} />}
            {step === 1 && <StepBirth data={data} update={update} onNext={() => go(2)} setError={setError} />}
            {step === 2 && <StepPreferences data={data} update={update} onSubmit={submit} saving={saving} setError={setError} />}
          </motion.div>
        </AnimatePresence>

        {error && <p role="alert" className="mt-5 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} disabled={saving} className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink-1">
            <ArrowLeft size={15} /> Back
          </button>
        )}
      </div>
    </div>
  )
}
