import { notFound } from 'next/navigation'
import ComingSoon from '@/components/app/ComingSoon'

const TYPES = ['love', 'career', 'education', 'health', 'wealth', 'travel', 'spirituality', 'children', 'legal']
export const metadata = { robots: { index: false } }

export default function ReportPage({ params }) {
  if (!TYPES.includes(params.type)) notFound()
  const name = params.type.charAt(0).toUpperCase() + params.type.slice(1)
  return <ComingSoon title={`${name} report`} text="Year-long life-area reports are being added." phase="Phase 7" />
}
