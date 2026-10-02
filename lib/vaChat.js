// Ask VA chat rules, kept identical to the mobile app (screens/chat/ChatScreen.js) unless noted.
import { AGENTS } from './agents'

export const VA_PRICE = 9
export const FREE_SECONDS = 180

export const LOADING_LINES = ['Waking up your astrologer…', 'Reading the cosmic alignments…', 'Preparing personalised insights…', 'Almost connected…']

// Shown in the typing bubble while a reply is on its way
export const THINKING_LINES = ['Looking at your chart…', 'Checking your dasha…', 'Reading the planets…', 'Writing your answer…']

const CONFIRM_TEXT = {
  English: (name) => `Would you like me to connect you to our ${name} Specialist now?`,
  Hindi: (name) => `क्या आप चाहते हैं कि मैं आपको हमारे ${name} विशेषज्ञ से जोड़ूं?`,
  Bengali: (name) => `আপনি কি চান আমি আপনাকে আমাদের ${name} specialist এর সাথে সংযুক্ত করি?`,
}
export const confirmText = (language, name) => (CONFIRM_TEXT[language] || CONFIRM_TEXT.English)(name)

// ROUTE_TO categories from the VA prompt (and the Astrologers chip) → where they open on the web
const CATEGORY_TO_AGENT = {
  love: 'love', career: 'career', education: 'education', health: 'health', wealth: 'wealth', travel: 'travel',
  spirituality: 'spirituality', legal: 'legal', children: 'children_parenthood', property: 'property',
  business: 'business', pitru: 'pitru_dosha', marriage: 'marriage_timing', numerology_tarot: 'numerology_tarot',
}
const CATEGORY_PAGES = {
  kundli: { href: '/kundli', label: 'Kundli', avatar: '/agents/kundli.webp', person: 'Satyaban' },
  remedies: { href: '/remedies', label: 'Remedies', avatar: '/agents/remedy.webp', person: 'Savitri' },
}

// { href, label, person, avatar } for a category, or null if we don't know it
export function categoryTarget(category) {
  const key = category?.toLowerCase()
  if (CATEGORY_PAGES[key]) return CATEGORY_PAGES[key]
  const agent = AGENTS.find((a) => a.key === CATEGORY_TO_AGENT[key])
  if (!agent) return null
  return { href: `/chat/${agent.key}`, label: agent.title.split(',')[0], person: agent.name, avatar: agent.avatar }
}

const HOROSCOPES = {
  daily: { href: '/horoscope/daily', label: 'Daily Horoscope' },
  monthly: { href: '/horoscope/monthly', label: 'Monthly Horoscope' },
  yearly: { href: '/horoscope/yearly', label: 'Yearly Horoscope' },
  lifetime: { href: '/horoscope/lifetime', label: 'Lifetime Analysis' },
}

// Splits a reply into the text to show and an optional follow-up card from its ROUTE_TO signal
export function parseReply(raw) {
  const horoscope = raw.match(/ROUTE_TO:horoscope:(daily|monthly|yearly|lifetime)/i)
  const specialist = !horoscope ? raw.match(/ROUTE_TO:(\w+)/) : null
  const text = raw.replace(/ROUTE_TO:horoscope:\w+/gi, '').replace(/ROUTE_TO:\w+/g, '').trim()
  let card = null
  if (horoscope) card = { kind: 'horoscope', ...HOROSCOPES[horoscope[1].toLowerCase()] }
  else if (specialist) {
    const target = categoryTarget(specialist[1])
    if (target) card = { kind: 'specialist', category: specialist[1].toLowerCase(), ...target }
  }
  return { text, card }
}

// The chips under the chat box. The VA prompt tells users to tap these, so the labels must match.
export const CHIP_GROUPS = [
  { id: 'horoscope', label: 'Horoscope', items: Object.entries(HOROSCOPES).map(([id, h]) => ({ id, label: h.label.replace(' Horoscope', ''), href: h.href })) },
  {
    id: 'reports',
    label: 'Reports',
    items: ['love', 'career', 'education', 'health', 'wealth', 'travel', 'spirituality', 'children', 'legal'].map((id) => ({
      id, label: id.charAt(0).toUpperCase() + id.slice(1), href: `/reports/${id}`,
    })),
  },
  { id: 'kundli', label: 'Kundli', items: [{ id: 'chart', label: 'Kundli Chart', href: '/kundli' }, { id: 'matching', label: 'Kundli Matching', href: '/kundli/matching' }] },
  {
    id: 'astrologers',
    label: 'Astrologers',
    items: ['love', 'career', 'health', 'wealth', 'education', 'travel', 'spirituality', 'children', 'legal', 'property', 'business', 'pitru', 'marriage', 'remedies', 'kundli']
      .map((c) => ({ id: c, category: c, ...categoryTarget(c) })),
  },
]

// Very small formatter for model replies: **bold** and line breaks, nothing else (no HTML injection)
export function replyParts(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) =>
    part.startsWith('**') && part.endsWith('**') ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part }
  )
}
