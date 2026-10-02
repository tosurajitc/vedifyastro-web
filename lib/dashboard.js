// Display helpers for the dashboard cards (colours match the app's modals)

export const PLANET_COLOR = {
  Sun: '#FF8F00', Moon: '#7986CB', Mars: '#EF5350', Mercury: '#66BB6A', Jupiter: '#FFA726',
  Venus: '#EC407A', Saturn: '#AB47BC', Rahu: '#78909C', Ketu: '#8D6E63',
}

// /dashboard/insights/today mood → badge (the engine uses five moods; the app only styled three)
export const MOOD = {
  very_positive: { label: 'Excellent energy', color: '#34D399' },
  positive: { label: 'Positive energy', color: '#66BB6A' },
  neutral: { label: 'Balanced energy', color: '#FBBF24' },
  challenging: { label: 'Go gently today', color: '#FB923C' },
  difficult: { label: 'Take it slow', color: '#F87171' },
}

// "6:24 AM" → minutes since midnight
export function clockToMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((t || '').trim())
  if (!m) return null
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(m[2])
}

// "9:56 AM - 11:26 AM" → [start, end] minutes
export function rangeToMinutes(r) {
  const [a, b] = (r || '').split('-').map((s) => clockToMinutes(s))
  return a != null && b != null ? [a, b] : null
}

export function greetingFor(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Share of a period elapsed, 0–100 (for the dasha progress bar)
export function periodProgress(start, end, now = new Date()) {
  const s = new Date(start), e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) return null
  return Math.max(0, Math.min(100, ((now - s) / (e - s)) * 100))
}

export const longDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// Lucky colour name → swatch (dashboardController also sends colorCode; this covers missing ones)
export const COLOR_HEX = {
  red: '#EF4444', orange: '#F97316', yellow: '#FACC15', gold: '#FFD700', green: '#22C55E', blue: '#3B82F6',
  white: '#F8FAFC', silver: '#CBD5E1', grey: '#9CA3AF', gray: '#9CA3AF', black: '#111827', pink: '#EC4899',
  purple: '#A855F7', violet: '#8B5CF6', cream: '#F5F0DC', maroon: '#7F1D1D', brown: '#92400E', saffron: '#F59E0B',
}
