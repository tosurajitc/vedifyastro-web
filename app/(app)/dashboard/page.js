import { redirect } from 'next/navigation'

// The dashboard (panchang, horoscope, dasha) arrives in Phase 5; until then the guide is home
export default function DashboardPage() {
  redirect('/chat/va')
}
