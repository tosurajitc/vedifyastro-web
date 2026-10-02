import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'
import { safeNext } from '@/lib/safeNext'
import WalletView from '@/components/wallet/WalletView'

export const metadata = { title: 'Wallet', robots: { index: false } }

export default async function WalletPage({ searchParams }) {
  const session = await loadSession()
  // ?next= comes from the chat's recharge prompt so the user can go straight back
  const next = searchParams?.next ? safeNext(searchParams.next, null) : null
  return (
    <WalletView
      payer={{ name: session.name, email: session.email, phone: session.phone }}
      guide={guideByKey(session.guide)}
      next={next}
    />
  )
}
