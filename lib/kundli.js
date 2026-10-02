// Kundli display helpers

export const PLANET_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' }

export const PLANET_HINDI = { Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangal', Mercury: 'Budh', Jupiter: 'Guru', Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu' }

export const SIGN_GLYPH = { Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓' }

// Traditional house names, used when the engine sends none
export const HOUSE_THEME = [
  'Self, body, personality', 'Wealth, family, speech', 'Courage, siblings, effort', 'Home, mother, comfort',
  'Children, creativity, intellect', 'Health, work, obstacles', 'Marriage, partnerships', 'Transformation, longevity',
  'Fortune, dharma, teachers', 'Career, status, karma', 'Gains, friends, wishes', 'Losses, moksha, foreign lands',
]

export const fmtDegree = (d) => (d == null ? '' : `${Math.floor(d)}°${String(Math.round((d % 1) * 60)).padStart(2, '0')}′`)

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

export const isNow = (start, end, now = new Date()) => new Date(start) <= now && now < new Date(end)
