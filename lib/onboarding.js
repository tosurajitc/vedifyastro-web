// Choices for the 3-step onboarding. Values match the mobile app (screens/auth/OnboardStep*.js)
// and what PUT /api/birth-details stores.
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const MARITAL = [
  { value: 'unmarried', label: 'Unmarried' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widow', label: 'Widow/Widower' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

// `name` is what the backend stores in preferred_language
export const LANGUAGES = [
  { name: 'English', native: 'English' },
  { name: 'Hindi', native: 'हिन्दी' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
  { name: 'Malayalam', native: 'മലയാളം' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Odia', native: 'ଓଡ଼ିଆ' },
]

// When birth time is unknown the app uses sunrise-ish 06:00
export const UNKNOWN_BIRTH_TIME = '06:00'

export function partOfDay(time) {
  const h = parseInt((time || '').split(':')[0], 10)
  if (Number.isNaN(h)) return null
  if (h >= 5 && h < 12) return 'Morning'
  if (h >= 12 && h < 17) return 'Afternoon'
  if (h >= 17 && h < 21) return 'Evening'
  return 'Night'
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim())

// OpenStreetMap place search, same source as the app. Returns [{ id, city, state, country, label }]
export async function searchPlaces(query, { india, signal }) {
  const params = new URLSearchParams({ q: query, format: 'json', limit: '6', addressdetails: '1' })
  if (india) params.set('countrycodes', 'in')
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal, headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return []
  const rows = await res.json()
  const seen = new Set()
  return rows
    .map((r) => {
      const a = r.address || {}
      const city = a.city || a.town || a.village || a.county || ''
      const state = a.state || a.state_district || ''
      const country = a.country || ''
      return { id: r.place_id, city, state, country, label: [city, state, country].filter(Boolean).join(', ') }
    })
    .filter((p) => p.city && !seen.has(p.label) && seen.add(p.label))
}
