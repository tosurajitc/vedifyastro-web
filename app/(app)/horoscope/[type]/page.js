import { notFound } from 'next/navigation'
import ComingSoon from '@/components/app/ComingSoon'

const TITLES = { daily: 'Daily Horoscope', monthly: 'Monthly Horoscope', yearly: 'Yearly Horoscope', lifetime: 'Lifetime Analysis' }
export const metadata = { robots: { index: false } }

export default function HoroscopePage({ params }) {
  const title = TITLES[params.type]
  if (!title) notFound()
  return <ComingSoon title={title} text="Personal horoscopes from your own chart are on their way." phase="Phase 5" />
}
