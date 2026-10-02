'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ChevronUp, Loader2, Mic, PhoneOff, RotateCcw, ShieldCheck, Square, Volume2, VolumeX, X } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { emitBalance } from '@/lib/walletEvents'
import { CHIP_GROUPS, FREE_SECONDS, LOADING_LINES, VA_PRICE, confirmText, parseReply } from '@/lib/vaChat'
import { blobToWavBase64, canRecord, createSpeaker, startRecording } from '@/lib/voice'
import { cn } from '@/lib/cn'
import { MessageBubble, RechargeDialog, SuggestionCard, TimeUpDialog, TimerChip, TypingBubble, mmss } from './ChatBits'

const STARTERS = ['When will my career take off?', 'Is this a good year for marriage?', 'Which planet is affecting me right now?', 'What does my kundli say about money?']
const MAX_RECORD_SECONDS = 60
const MUTE_KEY = 'va_muted'

let nextId = 1
const msgId = () => nextId++

// Pulsing avatar with a turning ring while the session is created (the app's loading screen)
function Connecting({ guide }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % LOADING_LINES.length), 1600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <motion.span className="absolute -inset-3 rounded-full border-2 border-dashed border-gold/50" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-gold/40">
          <Image src={guide.avatar} alt={guide.name} fill sizes="128px" className="object-cover" priority />
        </motion.div>
      </div>
      <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Connecting…</p>
      <h2 className="mt-2 font-display text-2xl font-black">{guide.name}</h2>
      <p className="text-sm text-ink-2">Your personal Vedic astrologer</p>
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-6 text-gold-soft">{LOADING_LINES[i]}</motion.p>
      </AnimatePresence>
      <p className="mt-8 inline-flex items-center gap-1.5 text-xs text-ink-3"><ShieldCheck size={13} className="text-gold" /> Private conversation</p>
    </div>
  )
}

export default function VAChat({ guide, greeting, language }) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState(null)
  const [connectError, setConnectError] = useState('')
  const [ready, setReady] = useState(false)
  const [messages, setMessages] = useState(() => [{ id: msgId(), role: 'assistant', content: greeting, at: Date.now() }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Billing: idle → free (3 min from the first message) → timeup → paid (₹9/min) → blocked (no balance)
  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [spent, setSpent] = useState(0)
  const [continuing, setContinuing] = useState(false)
  const [showTimeUp, setShowTimeUp] = useState(false)
  const [showRecharge, setShowRecharge] = useState(false)

  // Voice
  const speakerRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [needsTapId, setNeedsTapId] = useState(null)
  const recRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [transcribing, setTranscribing] = useState(false)

  const [openGroup, setOpenGroup] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const sessionRef = useRef(null)
  const endedRef = useRef(false)

  // ── Voice output ────────────────────────────────────────────────────────
  const speak = useCallback(async (msg, { force = false } = {}) => {
    if ((muted && !force) || !msg?.content?.trim()) return
    try {
      const res = await api('/tts/synthesize', { method: 'POST', body: { text: msg.content.trim(), language, gender: guide.ttsGender } })
      if (!res.audio) return
      setSpeakingId(msg.id)
      const played = await speakerRef.current.play(res.audio, { onEnd: () => setSpeakingId(null) })
      if (!played) { setSpeakingId(null); setNeedsTapId(msg.id) } else setNeedsTapId(null)
    } catch {
      setSpeakingId(null)
    }
  }, [muted, language, guide.ttsGender])

  // ── Session lifecycle ───────────────────────────────────────────────────
  const endSession = useCallback(() => {
    const id = sessionRef.current
    if (!id || endedRef.current) return
    endedRef.current = true
    // sendBeacon survives page unload; the cookie goes with it, the proxy adds the token
    if (!navigator.sendBeacon?.(`/api/chat/va/sessions/${id}/end`)) {
      fetch(`/api/chat/va/sessions/${id}/end`, { method: 'POST', keepalive: true }).catch(() => {})
    }
  }, [])

  const connect = useCallback(async () => {
    setConnectError('')
    const minDelay = new Promise((r) => setTimeout(r, 1400)) // let the connecting animation breathe
    try {
      const [res] = await Promise.all([api('/chat/va/sessions', { method: 'POST', body: {} }), minDelay])
      sessionRef.current = res.data.sessionId
      endedRef.current = false
      setSessionId(res.data.sessionId)
      setReady(true)
    } catch (e) {
      await minDelay
      setConnectError(e.message)
    }
  }, [])

  useEffect(() => {
    speakerRef.current = createSpeaker()
    try { setMuted(localStorage.getItem(MUTE_KEY) === '1') } catch {}
    connect()
    window.addEventListener('pagehide', endSession)
    return () => {
      window.removeEventListener('pagehide', endSession)
      speakerRef.current?.stop()
      recRef.current?.cancel()
      endSession()
    }
  }, [connect, endSession])

  // Speak the greeting once connected (browsers may block this until the user taps)
  const greetedRef = useRef(false)
  useEffect(() => {
    if (ready && !greetedRef.current) {
      greetedRef.current = true
      speak(messages[0])
    }
  }, [ready, speak, messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  // ── Timer + billing ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'free' && phase !== 'paid') return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'free' && seconds >= FREE_SECONDS) {
      setPhase('timeup')
      setShowTimeUp(true)
    }
  }, [phase, seconds])

  const refreshBalance = useCallback(async () => {
    try {
      const b = await api('/wallet/balance')
      emitBalance(b.data.balance)
    } catch {}
  }, [])

  // "Continue" pays for the first paid minute; after that one minute is charged every 60 s.
  // (The app also charges immediately after continuing, which bills the first paid minute twice.)
  useEffect(() => {
    if (phase !== 'paid' || !sessionId) return
    const t = setInterval(async () => {
      try {
        const res = await api('/chat/deduct-va-points', { method: 'POST', body: { minutesUsed: 1, sessionId, specialistType: 'VA' } })
        setSpent((v) => v + (res.data.pointsDeducted || VA_PRICE))
        emitBalance(res.data.newBalance)
      } catch (e) {
        if (e instanceof ApiError && e.status === 402) {
          setPhase('blocked')
          setShowRecharge(true)
        }
      }
    }, 60_000)
    return () => clearInterval(t)
  }, [phase, sessionId])

  async function continuePaid() {
    setContinuing(true)
    try {
      await api(`/chat/va/sessions/${sessionId}/continue`, { method: 'POST', body: {} })
      setSpent((v) => v + VA_PRICE)
      setPhase('paid')
      setShowTimeUp(false)
      refreshBalance()
    } catch (e) {
      setShowTimeUp(false)
      if (e.status === 402) {
        setPhase('blocked')
        setShowRecharge(true)
      }
    } finally {
      setContinuing(false)
    }
  }

  function endChat() {
    setShowTimeUp(false)
    setShowRecharge(false)
    speakerRef.current?.stop()
    endSession()
    router.push('/')
  }

  // ── Messages ────────────────────────────────────────────────────────────
  const canTalk = () => {
    if (phase === 'timeup') { setShowTimeUp(true); return false }
    if (phase === 'blocked') { setShowRecharge(true); return false }
    return true
  }

  async function send(text = input) {
    const message = text.trim()
    if (!message || sending || !sessionId || !canTalk()) return
    setInput('')
    setOpenGroup(null)
    speakerRef.current?.stop()
    setMessages((m) => [...m, { id: msgId(), role: 'user', content: message, at: Date.now() }])
    if (phase === 'idle') setPhase('free')
    setSending(true)
    try {
      const res = await api('/chat/message', { method: 'POST', body: { sessionId, message } })
      const { text: reply, card } = parseReply(res.response || '')
      const aiMsg = { id: msgId(), role: 'assistant', content: reply || '…', at: Date.now() }
      setMessages((m) => [...m, aiMsg, ...(card ? [{ id: msgId(), role: 'card', card: { ...card, prompt: card.kind === 'specialist' ? confirmText(language, card.label) : `Tap below to open your ${card.label}.` }, at: Date.now() }] : [])])
      speak(aiMsg)
    } catch {
      setMessages((m) => [...m, { id: msgId(), role: 'assistant', content: "I couldn't process that request. Please try asking me something else.", at: Date.now() }])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Astrologers chip: same as the app — show the request, then a connect card
  function pickSpecialist(item) {
    if (!canTalk()) return
    setOpenGroup(null)
    if (phase === 'idle') setPhase('free')
    setMessages((m) => [
      ...m,
      { id: msgId(), role: 'user', content: `Connect me to ${item.label}`, at: Date.now() },
      { id: msgId(), role: 'card', card: { kind: 'specialist', ...item, prompt: confirmText(language, item.label) }, at: Date.now() },
    ])
  }

  // ── Voice input ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  async function toggleMic() {
    if (recording) return stopMic()
    if (!canTalk()) return
    speakerRef.current?.stop()
    try {
      recRef.current = await startRecording()
      setRecSeconds(0)
      setRecording(true)
    } catch {
      setMessages((m) => [...m, { id: msgId(), role: 'system', content: 'Microphone access was blocked. Allow it in your browser to speak your question.', at: Date.now() }])
    }
  }

  const stopMic = useCallback(async () => {
    const rec = recRef.current
    recRef.current = null
    setRecording(false)
    if (!rec) return
    setTranscribing(true)
    try {
      const blob = await rec.stop()
      const { base64, seconds: dur } = await blobToWavBase64(blob)
      if (dur < 0.5) return
      const res = await api('/chat/speech-to-text', { method: 'POST', body: { audio: base64 } })
      if (res.text) setInput((v) => (v ? `${v} ${res.text}` : res.text))
      inputRef.current?.focus()
    } catch {
      setMessages((m) => [...m, { id: msgId(), role: 'system', content: "Sorry, I couldn't hear that clearly. Please try again or type your question.", at: Date.now() }])
    } finally {
      setTranscribing(false)
    }
  }, [])

  useEffect(() => {
    if (recording && recSeconds >= MAX_RECORD_SECONDS) stopMic()
  }, [recording, recSeconds, stopMic])

  function toggleMute() {
    const next = !muted
    setMuted(next)
    if (next) { speakerRef.current?.stop(); setSpeakingId(null) }
    try { localStorage.setItem(MUTE_KEY, next ? '1' : '0') } catch {}
  }

  const onlyGreeting = messages.length === 1
  const group = CHIP_GROUPS.find((g) => g.id === openGroup)

  return (
    <section className="py-4 sm:py-8">
      <div className="wrap max-w-4xl">
        <div className="glass relative flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col overflow-hidden rounded-[2rem] sm:h-[calc(100dvh-9rem)]">
          {!ready ? (
            connectError ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-ink-2">{connectError}</p>
                <button type="button" onClick={connect} className="inline-flex items-center gap-2 rounded-full bg-gold-grad px-5 py-3 font-bold text-cosmos-950"><RotateCcw size={16} /> Try again</button>
              </div>
            ) : (
              <Connecting guide={guide} />
            )
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
                <div className="relative">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold/60">
                    <Image src={guide.avatar} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-cosmos-900 bg-emerald-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{guide.name}</p>
                  <p className="truncate text-xs text-ink-2">
                    {sending ? <span className="text-gold-soft">typing…</span> : speakingId ? <span className="text-aqua">speaking…</span> : 'Your Vedic AI astrologer'}
                  </p>
                </div>
                <TimerChip phase={phase} seconds={seconds} spent={spent} />
                <button type="button" onClick={toggleMute} aria-label={muted ? 'Turn voice on' : 'Mute voice'} title={muted ? 'Voice off' : 'Voice on'}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line-2 text-ink-2 transition hover:text-ink-1">
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button type="button" onClick={endChat} aria-label="End chat" title="End chat"
                  className="grid h-9 w-9 place-items-center rounded-full border border-rose/40 text-rose-200 transition hover:bg-rose/15">
                  <PhoneOff size={16} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
                {messages.map((m) =>
                  m.role === 'card' ? (
                    <SuggestionCard key={m.id} card={m.card} onDismiss={() => setMessages((all) => all.filter((x) => x.id !== m.id))} />
                  ) : m.role === 'system' ? (
                    <p key={m.id} className="mx-auto max-w-md rounded-2xl bg-white/5 px-4 py-2 text-center text-xs text-ink-2">{m.content}</p>
                  ) : (
                    <MessageBubble key={m.id} msg={m} guide={guide} speaking={speakingId === m.id} needsTap={needsTapId === m.id}
                      onSpeak={m.role === 'assistant' ? () => (speakingId === m.id ? (speakerRef.current.stop(), setSpeakingId(null)) : speak(m, { force: true })) : null} />
                  )
                )}
                {sending && <TypingBubble guide={guide} />}

                {onlyGreeting && !sending && (
                  <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }} className="ml-10 flex flex-wrap gap-2">
                    {STARTERS.map((q) => (
                      <motion.button key={q} type="button" onClick={() => send(q)} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                        className="rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-sm text-ink-1 transition hover:border-gold hover:bg-gold/15">
                        {q}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Chips the VA prompt refers to ("tap Horoscope just below this chat") */}
              <div className="relative border-t border-line px-3 pt-3 sm:px-5">
                <AnimatePresence>
                  {group && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
                      className="absolute inset-x-3 bottom-full mb-2 max-h-72 overflow-y-auto rounded-3xl border border-line-2 bg-cosmos-800/95 p-3 shadow-glow backdrop-blur-xl sm:inset-x-5">
                      <div className="mb-2 flex items-center justify-between px-1">
                        <p className="text-sm font-bold text-gold-soft">{group.label}</p>
                        <button type="button" onClick={() => setOpenGroup(null)} aria-label="Close" className="text-ink-3 hover:text-ink-1"><X size={16} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {group.items.map((it) =>
                          group.id === 'astrologers' ? (
                            <button key={it.id} type="button" onClick={() => pickSpecialist(it)} className="flex items-center gap-2.5 rounded-2xl border border-line-2 bg-white/5 p-2 text-left transition hover:border-gold/50">
                              {it.avatar && <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full"><Image src={it.avatar} alt="" fill sizes="36px" className="object-cover" /></span>}
                              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-1">{it.person}</span><span className="block truncate text-[11px] text-ink-3">{it.label}</span></span>
                            </button>
                          ) : (
                            <Link key={it.id} href={it.href} className="rounded-2xl border border-line-2 bg-white/5 px-3 py-3 text-sm font-semibold text-ink-1 transition hover:border-gold/50">{it.label}</Link>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CHIP_GROUPS.map((g) => (
                    <button key={g.id} type="button" onClick={() => setOpenGroup((v) => (v === g.id ? null : g.id))} aria-expanded={openGroup === g.id}
                      className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
                        openGroup === g.id ? 'border-gold bg-gold text-cosmos-950' : 'border-line-2 bg-white/5 text-ink-2 hover:text-ink-1')}>
                      {g.label} <ChevronUp size={12} className={cn('transition', openGroup !== g.id && 'rotate-180')} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-end gap-2 px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
                {recording ? (
                  <div className="flex flex-1 items-center gap-3 rounded-3xl border border-rose/40 bg-rose/10 px-4 py-3">
                    <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-rose" /></span>
                    <span className="flex-1 text-sm text-ink-1">Listening… <span className="tabular-nums text-ink-2">{mmss(recSeconds)}</span></span>
                    <button type="button" onClick={() => { recRef.current?.cancel(); recRef.current = null; setRecording(false) }} className="text-xs font-semibold text-ink-2 hover:text-ink-1">Cancel</button>
                  </div>
                ) : (
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder={transcribing ? 'Turning your voice into text…' : `Ask ${guide.name} anything…`}
                    disabled={transcribing}
                    maxLength={2000}
                    className="max-h-32 min-h-[48px] flex-1 resize-none rounded-3xl border border-line-2 bg-white/5 px-4 py-3 text-[15px] text-ink-1 placeholder:text-ink-3 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  />
                )}
                {canRecord() && (
                  <button type="button" onClick={toggleMic} disabled={transcribing || sending} aria-label={recording ? 'Stop and use what I said' : 'Speak your question'}
                    className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full border transition disabled:opacity-50',
                      recording ? 'border-rose bg-rose text-white' : 'border-line-2 bg-white/5 text-aqua hover:bg-white/10')}>
                    {transcribing ? <Loader2 size={20} className="animate-spin" /> : recording ? <Square size={18} /> : <Mic size={20} />}
                  </button>
                )}
                {!recording && (
                  <button type="submit" disabled={!input.trim() || sending || transcribing} aria-label="Send"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-grad text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none">
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} />}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-3">AI guidance from your Vedic chart — for reflection, not a substitute for medical, legal or financial advice.</p>
      </div>

      <TimeUpDialog open={showTimeUp} guide={guide} busy={continuing} onContinue={continuePaid} onEnd={endChat} />
      <RechargeDialog open={showRecharge} onClose={() => setShowRecharge(false)} onEnd={endChat} />
    </section>
  )
}
