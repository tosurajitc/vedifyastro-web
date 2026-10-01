import { KeyRound, Orbit, MessagesSquare } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'

const STEPS = [
  { icon: KeyRound, title: 'Sign in with Google or your phone', text: 'One tap. No passwords to remember.' },
  { icon: Orbit, title: 'Add your birth details', text: 'Date, time and place. We compute your chart in seconds and encrypt the details before storing them.' },
  { icon: MessagesSquare, title: 'Explore and ask', text: 'Read your free kundli and horoscopes, or chat with an AI astrologer — your first 3 minutes with Ask VA are free.' },
]

export default function HowItWorks() {
  return (
    <Section id="how" eyebrow="How it works" title="From birth time to clear answers in minutes">
      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block" aria-hidden="true" />
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1} className="relative text-center">
            <div className="relative mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-gold/40 bg-cosmos-800 shadow-glow-gold">
              <s.icon size={26} className="text-gold" />
              <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gold text-xs font-extrabold text-cosmos-950">{i + 1}</span>
            </div>
            <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{s.text}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
