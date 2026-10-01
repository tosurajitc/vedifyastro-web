'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Section from '@/components/ui/Section'

const FAQS = [
  { q: 'Are the astrologers real people?', a: 'No. Every specialist on VedifyAstro is an AI persona trained on Vedic astrology. The planetary positions come from Swiss Ephemeris; the AI explains what they mean for your question. We say this clearly because you deserve to know.' },
  { q: 'How accurate are the calculations?', a: 'Charts use Swiss Ephemeris with the Lahiri ayanamsa and Placidus houses — the same standards used by most Vedic astrology software. Accuracy depends most on your birth time, so enter it as precisely as you can.' },
  { q: 'Is my birth data safe?', a: 'Your birth date, time and place are encrypted with AES-256 before they are stored, and we never sell or share them. You can delete your account and data at any time.' },
  { q: 'What does it cost?', a: 'Your kundli, panchang and horoscopes are free. Chats cost ₹9 per minute (your first 3 minutes with Ask VA are free), and reports start at ₹99. You pay from a prepaid wallet; there is no subscription.' },
  { q: 'Which languages can I use?', a: 'English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia and Punjabi — type or speak in the one you are most comfortable with.' },
  { q: 'Is this a substitute for medical, legal or financial advice?', a: 'No. Astrology guidance is for reflection and planning. For health, legal or money decisions please also consult a qualified professional.' },
]

function Item({ f, open, onToggle, id }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button onClick={onToggle} aria-expanded={open} aria-controls={id} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold">{f.q}</span>
        <ChevronDown size={18} className={`shrink-0 text-gold transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{f.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <Section id="faq" eyebrow="Questions" title="Good to know">
      <div className="mx-auto grid max-w-3xl gap-3">
        {FAQS.map((f, i) => (
          <Item key={f.q} f={f} id={`faq-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </Section>
  )
}
