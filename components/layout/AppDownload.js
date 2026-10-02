import Image from 'next/image'
import { MessageCircle, Mic, Sparkles, Sun } from 'lucide-react'
import siteConfig from '@/site.config'
import { cn } from '@/lib/cn'

// "Get the app" panel at the top of the footer. Store buttons say "Coming soon" until
// siteConfig.brand.appLive / appStore are set.

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#34A853" d="M3.6 2.2 13.4 12l-9.8 9.8c-.4-.2-.6-.7-.6-1.2V3.4c0-.5.2-1 .6-1.2z" />
      <path fill="#FBBC04" d="m16.6 15.2-3.2-3.2 3.2-3.2 3.7 2.1c1 .6 1 1.6 0 2.2z" />
      <path fill="#EA4335" d="M13.4 12 3.6 21.8c.3.2.8.2 1.3-.1l11.7-6.5z" />
      <path fill="#4285F4" d="M13.4 12 16.6 8.8 4.9 2.3c-.5-.3-1-.3-1.3-.1z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.8-4.2zM14 5.3c.7-.8 1.2-2 1-3.2-1 0-2.3.7-3 1.5-.7.7-1.2 1.9-1.1 3.1 1.2.1 2.4-.6 3.1-1.4z" />
    </svg>
  )
}

function StoreButton({ href, mark, store, live }) {
  const inner = (
    <>
      {mark}
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-wider text-ink-3">{live ? 'Get it on' : 'Coming soon on'}</span>
        <span className="block text-base font-bold text-ink-1">{store}</span>
      </span>
    </>
  )
  const cls = 'inline-flex min-w-[190px] items-center gap-3 rounded-2xl border border-line-2 bg-cosmos-950/70 px-4 py-2.5'
  return live && href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(cls, 'transition hover:border-gold/60 hover:bg-cosmos-900')}>{inner}</a>
  ) : (
    <span className={cn(cls, 'cursor-default opacity-80')} aria-label={`${store}: coming soon`}>{inner}</span>
  )
}

// Small phone mock-up with a guide chat on screen
function PhoneMock() {
  return (
    <div className="relative mx-auto w-48 shrink-0 rotate-[4deg] rounded-[2.2rem] border-[6px] border-cosmos-700 bg-cosmos-900 p-2.5 shadow-glow sm:w-52" aria-hidden="true">
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-cosmos-700" />
      <div className="flex items-center gap-2">
        <span className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-gold/60"><Image src="/agents/va_female.webp" alt="" fill sizes="32px" className="object-cover" /></span>
        <div>
          <p className="text-[11px] font-bold leading-none text-ink-1">Savitri</p>
          <p className="text-[9px] text-emerald-300">online</p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-[10px] leading-snug">
        <p className="w-[85%] rounded-xl rounded-bl-sm bg-white/10 px-2.5 py-2 text-ink-1">Namaste! Jupiter enters your 10th house next month — a strong time for career moves.</p>
        <p className="ml-auto w-[70%] rounded-xl rounded-br-sm bg-gold-grad px-2.5 py-2 font-medium text-cosmos-950">Should I ask for the promotion?</p>
        <div className="flex w-14 gap-1 rounded-xl bg-white/10 px-2.5 py-2">
          {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5">
        <span className="flex-1 text-[9px] text-ink-3">Ask anything…</span>
        <Mic size={11} className="text-aqua" />
      </div>
      <span className="absolute -left-4 top-10 rounded-full bg-cosmos-950/90 px-2 py-1 text-[9px] font-semibold text-gold-soft ring-1 ring-gold/30">demo</span>
    </div>
  )
}

export default function AppDownload() {
  const { playStore, appStore, appLive } = siteConfig.brand
  return (
    <div id="get-app" className="wrap scroll-mt-20 pt-14">
      <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gradient-to-br from-cosmos-600/40 via-cosmos-800/60 to-cosmos-900 px-6 py-8 sm:px-10">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="max-w-lg text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <Sparkles size={12} /> Mobile app
            </span>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight">Your astrologer, in your pocket</h2>
            <p className="mt-2 text-ink-2">Same account, same wallet. Talk to your guide by voice, and get your daily horoscope wherever you are.</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-ink-2 md:justify-start">
              <li className="inline-flex items-center gap-1.5"><Mic size={14} className="text-aqua" /> Voice chat</li>
              <li className="inline-flex items-center gap-1.5"><MessageCircle size={14} className="text-gold" /> 17 AI astrologers</li>
              <li className="inline-flex items-center gap-1.5"><Sun size={14} className="text-gold" /> Daily horoscope</li>
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <StoreButton href={playStore} mark={<PlayMark />} store="Google Play" live={appLive} />
              <StoreButton href={appStore} mark={<AppleMark />} store="App Store" live={!!appStore} />
            </div>
          </div>
          <PhoneMock />
        </div>
      </div>
    </div>
  )
}
