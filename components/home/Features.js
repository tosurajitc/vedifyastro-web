'use client'

import { motion } from 'framer-motion'
import { CalendarDays, Gem, HeartHandshake, LineChart, Mic, ScrollText, Sparkles, Sun } from 'lucide-react'
import Section from '@/components/ui/Section'
import ChatPreview from './ChatPreview'
import { PRICES } from '@/lib/pricing'

const FEATURES = [
  { icon: ScrollText, title: 'Complete Kundli', text: 'D1–D60 divisional charts, Vimshottari dasha timeline, yogas, doshas and planetary strength, with a downloadable PDF.', tag: 'Free' },
  { icon: Sun, title: 'Daily Panchang & Insight', text: 'Tithi, nakshatra, Rahu Kaal and muhurat for your city, plus a transit-based insight for your Moon sign.', tag: 'Free' },
  { icon: CalendarDays, title: 'Horoscopes', text: 'Daily, monthly, yearly and lifetime readings built from your own chart, not just your sun sign.', tag: 'Free' },
  { icon: HeartHandshake, title: 'Kundli Matching', text: 'Ashtakoota guna milan out of 36, Mangal dosha check and an AI explanation of what the score means.', tag: `₹${PRICES.kundliMatching}` },
  { icon: LineChart, title: 'Life-area Reports', text: 'Career, wealth, health, love, legal, travel, education and spirituality reports valid for a full year.', tag: `₹${PRICES.report}` },
  { icon: Gem, title: 'Personal Remedies', text: 'Gemstones, mantras, rudraksha and daily practices matched to the planets that need support in your chart.', tag: `₹${PRICES.remedies}` },
]

export default function Features() {
  return (
    <Section
      id="features"
      eyebrow="What you get"
      title="Real calculations. Clear explanations."
      lead="The astronomy is computed, not guessed: Swiss Ephemeris, Lahiri ayanamsa, Placidus houses. AI then explains it in plain language."
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-grad shadow-glow">
                  <f.icon size={20} />
                </span>
                <span className={f.tag === 'Free' ? 'rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-300' : 'rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold'}>
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <ChatPreview />
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5"><Sparkles size={15} className="text-gold" /> Grounded in your chart</span>
            <span className="inline-flex items-center gap-1.5"><Mic size={15} className="text-aqua" /> Speak or type</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
