'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Bot, ChartLine, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import siteConfig from '@/site.config'

const TABS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/llm', label: 'LLM usage', icon: ChartLine },
  { href: '/admin/feedback', label: 'AI feedback', icon: Bot },
]

// Left sidebar on large screens; a top bar with scrolling tabs on small ones
export default function AdminNav({ role }) {
  const path = usePathname()
  return (
    <aside className="shrink-0 border-b border-line bg-cosmos-950/60 backdrop-blur lg:flex lg:h-full lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:block lg:px-5 lg:pt-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src={siteConfig.brand.logo} alt="" width={32} height={32} />
          <span className="font-display text-lg font-black">{siteConfig.brand.name}</span>
        </Link>
        <div className="flex items-center gap-2 lg:mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
            <ShieldCheck size={12} /> {String(role).replace(/_/g, ' ')}
          </span>
          <Link href="/dashboard" className="rounded-full p-2 text-ink-2 hover:bg-white/10 hover:text-ink-1 lg:hidden" aria-label="Back to site" title="Back to site">
            <ArrowLeft size={17} />
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 py-3 lg:mt-6 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:py-0" aria-label="Admin sections">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? path === href : path === href || path.startsWith(`${href}/`)
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined}
              className={cn('inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition lg:flex',
                active ? 'bg-gold text-cosmos-950' : 'text-ink-2 hover:bg-white/10 hover:text-ink-1')}>
              <Icon size={17} /> {label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <Link href="/dashboard" className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-2 transition hover:bg-white/10 hover:text-ink-1">
          <ArrowLeft size={17} /> Back to site
        </Link>
      </div>
    </aside>
  )
}
