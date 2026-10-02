'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Gift, LogOut, Wallet } from 'lucide-react'
import { guideByKey } from '@/lib/guides'

export const formatPoints = (n) => Math.floor(Number(n) || 0).toLocaleString('en-IN')

// Wallet chip + avatar menu for signed-in users
export default function UserMenu({ user, balance, onSignedOut }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const guide = guideByKey(user.guide)

  useEffect(() => {
    if (!open) return
    const close = (e) => (e.key === 'Escape' || (e.type === 'mousedown' && !ref.current?.contains(e.target))) && setOpen(false)
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('mousedown', close); window.removeEventListener('keydown', close) }
  }, [open])

  async function signOut() {
    await fetch('/api/session/logout', { method: 'POST' }).catch(() => {})
    onSignedOut?.()
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {balance !== null && (
        <Link href="/wallet" className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-bold text-gold-soft transition hover:bg-gold/20" title="VA Points (1 point = ₹1) · open wallet">
          <Wallet size={15} /> {formatPoints(balance)}
        </Link>
      )}
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu"
          className="flex items-center gap-2 rounded-full border border-line-2 bg-white/5 py-1 pl-1 pr-3 text-sm font-semibold transition hover:bg-white/10">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-grad text-sm font-black">{user.name.charAt(0).toUpperCase()}</span>
          <span className="hidden max-w-[120px] truncate lg:inline">{user.name.split(' ')[0]}</span>
          <ChevronDown size={14} className="text-ink-3" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div role="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line-2 bg-cosmos-800 p-1.5 shadow-glow">
              <div className="px-3 py-2.5">
                <p className="truncate font-semibold text-ink-1">{user.name}</p>
                <p className="truncate text-xs text-ink-3">{user.email || user.phone}</p>
              </div>
              {user.onboarded && (
                <Link href="/chat/va" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-1 hover:bg-white/5">
                  <span className="relative h-6 w-6 overflow-hidden rounded-full"><Image src={guide.avatar} alt="" fill sizes="24px" className="object-cover" /></span>
                  Talk to {guide.name}
                </Link>
              )}
              {user.onboarded && (
                <>
                  <Link href="/wallet" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-1 hover:bg-white/5">
                    <Wallet size={16} className="ml-1 text-gold" /> Wallet
                  </Link>
                  <Link href="/wallet/refer" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-1 hover:bg-white/5">
                    <Gift size={16} className="ml-1 text-gold" /> Refer & earn
                  </Link>
                </>
              )}
              <button type="button" role="menuitem" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 hover:bg-white/5 hover:text-ink-1">
                <LogOut size={16} className="ml-1" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
