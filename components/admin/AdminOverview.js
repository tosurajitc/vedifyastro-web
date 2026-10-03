'use client'

import Link from 'next/link'
import { ArrowRight, Bot, ChartLine, CircleDollarSign, Server, UserCheck, UserPlus, Users } from 'lucide-react'
import { Failed, Panel, Skeleton, Stat, emailOf, num, phoneOf, usd, useAdminData } from './ui'

const LINKS = [
  { href: '/admin/users', title: 'User management', body: 'Find users, see their usage, activate or deactivate accounts.', icon: Users },
  { href: '/admin/llm', title: 'LLM usage', body: 'Tokens, cost and requests by feature, endpoint or user.', icon: ChartLine },
  { href: '/admin/feedback', title: 'AI feedback review', body: 'Thumbs-down rates per specialist and prompt suggestions to approve.', icon: Bot },
]

const isToday = (d) => d && new Date(d).toDateString() === new Date().toDateString()

export default function AdminOverview() {
  // Users come newest first, so the first 100 cover today's sign-ups on all but very busy days.
  // Active users are counted by the backend's filter rather than from one page of users.
  const recent = useAdminData('/admin/users?page=1&limit=100')
  const active = useAdminData('/admin/users?page=1&limit=1&status=active')
  const llm = useAdminData('/admin/llm/analytics')

  const totalUsers = recent.data?.pagination?.totalUsers ?? 0
  const activeUsers = active.data?.pagination?.totalUsers ?? 0
  const newToday = (recent.data?.users || []).filter((u) => isToday(u.created_at)).length
  const totals = llm.data?.totals || {}
  const loading = recent.loading || active.loading || llm.loading
  const error = recent.error || active.error || llm.error

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Overview</h1>

      {error ? (
        <Panel><Failed error={error} onRetry={() => { recent.reload(); active.reload(); llm.reload() }} /></Panel>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="glass rounded-[1.25rem] p-5"><Skeleton rows={2} /></div>)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={num(totalUsers)} hint={`${newToday} new today`} icon={Users} />
          <Stat label="Active users" value={num(activeUsers)} hint={`${totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0}% of all users`} icon={UserCheck} />
          <Stat label="LLM cost" value={usd(totals.grand_total_cost, 2)} hint="All time" icon={CircleDollarSign} />
          <Stat label="LLM requests" value={num(totals.grand_total_requests)} hint={`${num(totals.grand_total_tokens)} tokens`} icon={Server} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {LINKS.map(({ href, title, body, icon: Icon }) => (
          <Link key={href} href={href} className="glass group rounded-[1.5rem] p-5 transition hover:border-gold/50 sm:p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 text-gold"><Icon size={20} /></span>
            <h2 className="mt-4 flex items-center gap-2 font-bold text-ink-1">{title} <ArrowRight size={16} className="text-ink-3 transition group-hover:translate-x-1 group-hover:text-gold" /></h2>
            <p className="mt-1 text-sm text-ink-2">{body}</p>
          </Link>
        ))}
      </div>

      {!loading && !error && newToday > 0 && (
        <Panel title="Joined today" icon={UserPlus}>
          <ul className="divide-y divide-white/5">
            {recent.data.users.filter((u) => isToday(u.created_at)).slice(0, 10).map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-gold-soft">
                  <span className="truncate">{u.name || emailOf(u) || phoneOf(u) || `User ${u.id}`}</span>
                  <span className="shrink-0 text-ink-3">{new Date(u.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}
