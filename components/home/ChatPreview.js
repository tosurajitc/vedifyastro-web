'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Send } from 'lucide-react'

// Scripted demo conversation (illustrative). Replays while the card is on screen.
const SCRIPT = [
  { from: 'user', text: 'Will I get a new job this year? Born 14 Mar 1994, 6:20 AM, Pune.' },
  { from: 'ai', text: 'Your Moon is in Pushya and you are running Jupiter–Saturn dasha. Jupiter transits your 10th house from mid-year — a strong window for a role change between June and October.' },
  { from: 'user', text: 'What should I focus on?' },
  { from: 'ai', text: 'Saturn rewards structured effort here: certifications and internal moves work better than cold applications. Thursdays are favourable for interviews.' },
]

export default function ChatPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-80px' })
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (shown >= SCRIPT.length) {
      const t = setTimeout(() => setShown(0), 6000) // loop
      return () => clearTimeout(t)
    }
    const next = SCRIPT[shown]
    setTyping(next.from === 'ai')
    const t = setTimeout(() => { setTyping(false); setShown((n) => n + 1) }, next.from === 'ai' ? 1700 : 900)
    return () => clearTimeout(t)
  }, [inView, shown])

  return (
    <div ref={ref} className="glass mx-auto w-full max-w-md overflow-hidden rounded-3xl shadow-glow">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gold/40">
          <Image src="/agents/career.webp" alt="" fill sizes="40px" className="object-cover" />
        </div>
        <div>
          <div className="font-display text-sm font-bold">Snigdha · Career AI</div>
          <div className="text-xs text-emerald-400">online · reading your chart</div>
        </div>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ink-3">demo</span>
      </div>

      <div className="flex h-[300px] flex-col justify-end gap-3 px-5 py-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, shown).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={m.from === 'user'
                ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-cosmos-500 px-3.5 py-2.5 text-sm'
                : 'mr-auto max-w-[88%] rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2.5 text-sm text-ink-1'}
            >
              {m.text}
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mr-auto flex gap-1 rounded-2xl bg-white/10 px-3.5 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-2" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <div className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-ink-3">Ask about career, love, timing…</div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-grad text-cosmos-950"><Send size={16} /></span>
      </div>
    </div>
  )
}
