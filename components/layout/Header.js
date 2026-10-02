'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import siteConfig from '@/site.config'
import { cn } from '@/lib/cn'
import { onBalance } from '@/lib/walletEvents'
import UserMenu from './UserMenu'

// The httpOnly session cookie is invisible to scripts; va_in is a readable 'signed in' hint
const hasSessionHint = () => typeof document !== 'undefined' && /(?:^|; )va_in=1/.test(document.cookie)

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(null)
  const pathname = usePathname()

  // Re-check on navigation so the header updates right after login, onboarding or logout
  useEffect(() => {
    if (!hasSessionHint()) { setUser(null); setBalance(null); return }
    let cancelled = false
    fetch('/api/session').then((r) => r.json()).then(({ user }) => {
      if (cancelled) return
      setUser(user)
      if (user?.onboarded) {
        fetch('/api/wallet/balance').then((r) => r.json()).then((b) => !cancelled && setBalance(b?.data?.balance ?? null)).catch(() => {})
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [pathname])

  // Chat deductions and recharges announce the new balance
  useEffect(() => onBalance(setBalance), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Esc
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-line bg-cosmos-950/80 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
          <Image src={siteConfig.brand.logo} alt="" width={36} height={36} priority />
          <span className="font-display text-lg font-bold tracking-tight">{siteConfig.brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:bg-white/5 hover:text-ink-1">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? <UserMenu user={user} balance={balance} onSignedOut={() => { setUser(null); setBalance(null) }} /> : <>
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-ink-1 transition hover:bg-white/5">
            Sign in
          </Link>
          <Link href="/login?next=/dashboard" className="rounded-full bg-gold-grad px-4 py-2 text-sm font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
            Get free kundli
          </Link>
          </>}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-1 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-cosmos-950/95 backdrop-blur-xl md:hidden"
            aria-label="Mobile"
          >
            <div className="wrap flex flex-col gap-1 py-4">
              {siteConfig.nav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-ink-1 hover:bg-white/5">
                  {item.label}
                </Link>
              ))}
              {user ? (
                <div className="mt-2 flex justify-center"><UserMenu user={user} balance={balance} onSignedOut={() => { setUser(null); setBalance(null); setOpen(false) }} /></div>
              ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-line-2 py-2.5 text-center text-sm font-semibold">Sign in</Link>
                <Link href="/login?next=/dashboard" onClick={() => setOpen(false)} className="rounded-full bg-gold-grad py-2.5 text-center text-sm font-bold text-cosmos-950">Free kundli</Link>
              </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
